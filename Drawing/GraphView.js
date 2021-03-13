import {
    canvas, Tool, HighFPSFeature, backgroundGradient, fastOverlayCanvas, slowOverlayCanvas,
    CanvasType, incrementGlobalIndex, GraphCategory
} from "./General.js"
import Graph from "../Structure/Graph.js"
import {HighlightType} from "../Structure/Highlights.js";

import GraphMouseHandler from "./GraphMouseInteraction.js"
import GraphKeyboardHandler from "./GraphKeyboardInteraction.js"
import GraphSelection from "./GraphSelection.js"

import {
    colorFromComponents,
} from "../Structure/Utilities.js";
import PropertyList from "./Properties/PropertyList.js";
import {generateRandomEdges, generateRandomNodes} from "./GraphViewDebugHelper.js";
import {regularNodeRadius} from "../Structure/Node.js";

import HistoryTracker from "./HistoryTracker.js"
import {testBasicRoutine} from "./GraphViewTests.js";
import cacheFrames from "./GraphFrameCaching.js";
import { refreshInterfaceCategories } from "./Interaction.js";
import {
    checkLineLineCollision,
    checkLinePointCollision, checkRectanglePointCollision, checkRectangleSquareCollision,
    checkSquarePointCollision, createRectangleChecker, rotatePoint, translateWithAngle
} from "./GeometryHelper.js";
// Registrando componente custom
customElements.define('property-list', PropertyList)
const toolTrayElement = document.querySelector("#tool_tray")
const IDLE_MAX_FPS = 10;

const NodeLabeling = {
    NUMBERS: "numbers",
    LETTERS_RAND: "letters_randomized",
    LETTERS_ORD: "letters_ordered"
}

// Graph
class GraphView {
    constructor (canvas, slowCanvas, fastCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.fastCanvas = fastCanvas;
        this.fastCanvas.style.pointerEvents = "none";
        this.fastCtx = this.fastCanvas.getContext("2d");

        this.slowCanvas = slowCanvas;
        this.slowCanvas.style.pointerEvents = "none";
        this.slowCtx = this.slowCanvas.getContext("2d");


        this.structure = new Graph();
        this.nodeLabeling = NodeLabeling.LETTERS_RAND;

        // INTERACTION
        this.selectionHandler = new GraphSelection(this);
        this.mouseHandler     = new GraphMouseHandler(this);
        this.keyboardHandler  = new GraphKeyboardHandler(this);

        // Mouse
        canvas.onmousedown  = this.mouseHandler.mouseDownEvent;
        canvas.onmousemove  = this.mouseHandler.mouseDragEvent;
        canvas.onmouseup    = this.mouseHandler.mouseUpEvent;
        canvas.onmouseleave = this.mouseHandler.mouseLeaveEvent;

        // Evite abrir o menu de contexto para não haver conflito com o gesto
        // de deletar nós.
        canvas.oncontextmenu = event => event.preventDefault();

        // Keyboard
        document.body.onkeydown = this.keyboardHandler.keyPressed;
        document.body.onkeyup = this.keyboardHandler.keyReleased;

        // HISTORY
        this.history = new HistoryTracker();
        // this.history.registerStep(this.structure.clone())
        this.registerStep()
        // Debugging
        // generateRandomNodes(this, 4)
        // generateRandomEdges(this, 3)
        // for (let j = 0; j < getRandomInt(0, 3); j++ ) {
        //     let r = getRandomInt(0, 3)
        //     Array.from(this.structure.nodes())[r].highlights.add(NodeHighlightType.ALGORITHM_FOCUS)
        // }
    }

    debugBalls = []

    /// Overlay de importação
    _overlay = false;
    get overlay() {
        return this._overlay;
    }
    set overlay(newState) {
        this._overlay = newState;
        // Chama uma atualização do canvas que se mantém até o overlay sair
        this.requestCanvasRefresh(CanvasType.FAST);
    }

    /// Ferramenta escolhida
    _primaryTool = Tool.MOVE;
    get primaryTool() {
        return this._primaryTool;
    }
    set primaryTool(anotherTool) {
        this._primaryTool = anotherTool;
        // Para de atualizar a aresta temporária caso tenha saído da ferramenta
        if (this.primaryTool !== Tool.CONNECT) {
            this.mouseHandler.shouldDrawTemporaryEdge = false;
        }
        this.refreshTrayIcons()
    }


    // Interaction

    /* Atualiza o tipo de grafo sendo exibido */
    updateGraphConstructors(categories) {
        let [GraphType, NodeType, EdgeType] = Graph.getConstructorsFromCategories(categories)

        if (g.structure.constructor != GraphType) {
            g.structure = GraphType.from(g.structure);
        }
        g.structure = g.structure.cloneAndTransform({
                                                      NodeConstructor: NodeType,
                                                      EdgeConstructor: EdgeType
        });
        g.refreshGraph();
    }

    /* Atualiza os botões para que eles reflitam o estado das ferramentas */
    refreshTrayIcons() {
        for (let element of toolTrayElement.getElementsByTagName("input")) {
            if (element.value === this.primaryTool) { element.click(); }
        }
        this.mouseHandler.refreshCursorStyle();
    }

    selectAllNodes() {
        let allElements = [];
        switch (this.primaryTool) {
        case Tool.MOVE:
            allElements = Array.from(this.structure.nodes());
            break;
        case Tool.CONNECT:
            allElements = Array.from(this.structure.edges()).map(e => e[0]);
            break;
        }
        this.selectionHandler.selectMultiple(allElements);
    }

    /* Destaca os nós selecionados */
    isShowingDashedTools = false;
    selectionChanged() {
        // console.log(Math.random())
        let shouldShowDashedTools = false;
        for (let node of this.structure.nodes()) {
            if (this.selectionHandler.isSelected(node)
                && this.selectionHandler.isQuickSelection === false) {
                shouldShowDashedTools = true;
                node.highlights.add(HighlightType.SELECTION)
            } else {
                node.highlights.remove(HighlightType.SELECTION)
            }
        }

        for (let [edge, ,] of this.structure.edges()) {
            if (this.selectionHandler.isSelected(edge)) {
                shouldShowDashedTools = true;
                edge.highlights.add(HighlightType.SELECTION)
            } else {
                edge.highlights.remove(HighlightType.SELECTION)
            }
        }

        if (this.isShowingDashedTools != shouldShowDashedTools) {
            if (shouldShowDashedTools) {
                let featureIcons = Array.from(document.getElementsByClassName("feature-icon"))
                featureIcons.forEach(icon => icon.classList.add("selected"))
            } else {
                let selectedElements = Array.from(document.getElementsByClassName("selected"))
                selectedElements.forEach(element => element.classList.remove("selected"))
            }
        }
        this.isShowingDashedTools = shouldShowDashedTools;
    }

    //region Deteção de Nós e Arestas

    // Searches for nodes that contain the point `pos`
    // The lookup is done from the last node to the first, the inverse of the
    // drawing lookup in order to return the frontmost node.
    getNodesAt(pos, checkForConflict = false) {
        let detectedNodes = [];
        for (let node of this.structure.nodes()) {
            let radiusCheck = Math.max(node.radius-4, regularNodeRadius);
            if (checkForConflict) { radiusCheck *= 2; }

            if (checkSquarePointCollision(node.pos, radiusCheck*2, pos)) {
                if (checkForConflict) return [node];
                detectedNodes.push(node);
            }
        }
        return detectedNodes;
    }

    checkIfNodeAt(pos, checkForConflict = false, exceptionIndex = null) {
        for (let node of this.structure.nodes()) {
            if (node.index == exceptionIndex) continue;

            let radiusCheck = Math.max(node.radius-4, regularNodeRadius);
            if (checkForConflict) { radiusCheck *= 2; }

            let collided = checkSquarePointCollision(
                node.pos, radiusCheck*2,
                pos)
            if (collided) { return node; }
        }
        return false;
    }

    getEdgesAt(pos) {
        let allEdges = []

        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            if (this.structure.categories.has(GraphCategory.DIRECTED_EDGES) == false
                || this.structure.checkEdgeBetween(nodeB, nodeA) == false) {
                let collided = checkLinePointCollision(
                    nodeA.pos, nodeB.pos, 1,
                    pos
                )
                if (collided) {
                    allEdges.push(edge);
                }
            } else {
                let angle = Math.atan2(nodeB.pos.y - nodeA.pos.y, nodeB.pos.x - nodeA.pos.x) - Math.PI / 2;

                let offsetA = translateWithAngle(nodeA.pos, angle, 0, 25)
                let offsetB = translateWithAngle(nodeB.pos, angle, 0, 25)

                let collided = checkLinePointCollision(
                    offsetA, offsetB, 5, pos
                )
                if (collided) {
                    allEdges.push(edge);
                }
            }
        }
        if (allEdges.length > 0) { this.requestCanvasRefresh(); }
        return allEdges;
    }

    getNodesWithin(initialPos, finalPos) {
        let nodesWithin = [];
        for (let node of this.structure.nodes()) {
            let collided = checkRectangleSquareCollision(
                [initialPos, finalPos],
                node.pos, node.radius*2
            )
            if (collided) { nodesWithin.push(node); }
        }
        return nodesWithin;
    }

    getEdgesWithin(initialPos, finalPos) {
        let edgesWithin = new Set();

        // Considera arestas contidas se um dos nós está contido.
        let nodesWithin = new Set(this.getNodesWithin(initialPos, finalPos));
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            if (nodesWithin.has(nodeA) || nodesWithin.has(nodeB)) {
                edgesWithin.add(edge);
            }
        }

        // Passa por todas as arestas restantes e considera contida caso haja
        // uma interseção entre uma das laterais da seleção e a aresta.
        let rectChecker = createRectangleChecker(initialPos,
                                                      finalPos);
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            if (edgesWithin.has(edge)) continue;
            if (rectChecker.checkLineCollision(nodeA.pos,
                                               nodeB.pos)) {
                edgesWithin.add(edge);
            }
        }
        return Array.from(edgesWithin);
    }
    //endregion

    //region Manipulação do Grafo

    registerStep() {
        this.history.registerStep(this.structure.clone())
    }

    nodeColorIndex = 0;
    insertNewNodeAt(pos) {
        if (this.checkIfNodeAt(pos, true)) {
            return false;
        }
        let newNode = new this.structure.NodeConstructor({x: pos.x, y:pos.y, colorIndex: this.nodeColorIndex++})
        let inserted = this.structure.insertNode(newNode);
        if (!inserted) { return; }
        incrementGlobalIndex();

        this.refreshGraph();
        this.registerStep();
        return newNode;
    }

    moveNode(node, pos) {
        // this.requestCanvasRefresh(CanvasType.FAST)
        this.requestFramerateForCanvas(CanvasType.GENERAL, HighFPSFeature.MOVING, 90);
        this.requestCanvasRefresh(CanvasType.SLOW)
        node.pos = pos;
    }

    removeNodeAt(pos) {
        let nodes = this.getNodesAt(pos)
        if (nodes.length === 0) {
            return;
        }
        let frontmostNode = nodes[0];
        for (let node of nodes) {
            if (node.index > frontmostNode.index) {
                frontmostNode = node;
            }
        }
        this.selectionHandler.clear()
        this.structure.removeNode(frontmostNode);
        this.refreshGraph();
        this.registerStep();
    }

    // ARESTAS
    insertEdgeBetween(nodeA, nodeB, refresh = true) {
        if(this.structure.checkEdgeBetween(nodeA, nodeB)) {
            console.error('Já existe uma aresta entre os nós.')
            return
        }

        let newEdge = new this.structure.EdgeConstructor();
        let inserted = this.structure.insertEdge(nodeA, nodeB, newEdge, !refresh);
        if (!inserted) {
            console.error('Aresta não pode ser inserida.')
            return;
        }

        if (refresh) {
            this.refreshGraph();
            this.registerStep();
        }
        return newEdge;
    }

    removeEdgeAt(pos) {
        let edge = this.getEdgesAt(pos).pop();
        if (!edge) { return; }

        this.selectionHandler.deselect(edge);
        this.structure.removeEdge(edge);
        this.registerStep();
    }

    snapNodesToGrid() {
        let gridCellSide = 2*regularNodeRadius + 20;
        for (let node of this.structure.nodes()) {
            node.pos.x = Math.round(node.pos.x / gridCellSide) * gridCellSide;
            node.pos.y = Math.round(node.pos.y / gridCellSide) * gridCellSide;
        }
        this.refreshGraph();
        this.registerStep();
    }

    blurTimeout = null;
    removeBlur = () => {
        this.canvas.classList.remove("blurred");
        this.slowCanvas.classList.remove("blurred");
        this.blurTimeout = null;
    }
    recalculateLayout() {
        let originalWidth = this.canvas.width;
        let originalHeight = this.canvas.height;

        // Ajustar tamanho
        let canvasArea = document.getElementById("canvasArea");
        let newWidth = canvasArea.offsetWidth;
        let newHeight = canvasArea.offsetHeight;
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.fastCanvas.width = newWidth;
        this.fastCanvas.height = newHeight;
        this.slowCanvas.width = newWidth;
        this.slowCanvas.height = newHeight;

        // Ajustando posição dos nós
        let widthRatio = newWidth/originalWidth;
        let heightRatio = newHeight/originalHeight;
        for (let node of this.structure.nodes()) {
            node.pos.x *= widthRatio;
            node.pos.y *= heightRatio;
        }

        // Blur
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        } else {
            this.canvas.classList.add("blurred");
            this.slowCanvas.classList.add("blurred");
        }
        this.blurTimeout = setTimeout(this.removeBlur, 250);

        this.refreshGraph();
    }
    refreshGraph() {
        this.requestCanvasRefresh(CanvasType.GENERAL);
        this.requestCanvasRefresh(CanvasType.SLOW);
    }

    loadSerializedGraph(serialized) {
        let deserializedGraph = Graph.deserialize(serialized);
        if (!deserializedGraph) { return; }
        this.structure = deserializedGraph;
        refreshInterfaceCategories();
        this.refreshGraph();
        this.registerStep();
    }

    //endregion

    //region Desenho do Grafo
    drawSelectionArea(ctx) {
        ctx.save();

        ctx.strokeStyle = 'blue';
        ctx.fillStyle = colorFromComponents(0, 0, 255, 0.1);
        ctx.lineWidth = 3;

        this.selectionHandler.prepareSelectionAreaDrawing(ctx);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    get width() {
        if (this.canvas.width != this.fastCanvas.width) {
            console.log(this.canvas.width, this.fastCanvas.width)
        }
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }

    // This function clears the canvas and redraws it.
    redrawGraph(background = false) {
        this.ctx.save();
        // TODO: Esse if é meio gambiarra, o fundo deveria ser transparente
        //       o tempo todo, e o cache deveria saber lidar com isso.
        if (background == false && !this.selectionHandler.shouldDrawSelection) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = backgroundGradient;
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fill();
        }

        // Desenhar arestas do grafo
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            edge.draw(this.ctx, nodeA.pos, nodeB.pos, window.performance.now(),
                      this.structure.checkEdgeBetween(nodeB, nodeA))
            // console.log(this.mouseHandler.clickedNode)
            this.ctx.save()
            this.ctx.fillStyle = "red"
            this.ctx.beginPath()
            // this.ctx.rect(nodeA.pos.x, nodeA.pos.y, getDistanceOf(nodeA.pos, nodeB.pos), 30);
            // this.ctx.rect(nodeA.pos.x, nodeA.pos.y, Math.abs(nodeB.pos.x-nodeA.pos.y), 50)
            this.ctx.fill()
            this.ctx.restore()
        }

        let nodeFPSRequests = [];
        for (let node of this.structure.nodes()) {
            nodeFPSRequests.push(
                node.draw(this.ctx)
            );
        }
        for (let [bx, by] of this.debugBalls) {
            this.ctx.save()
            this.ctx.fillStyle = "red"
            this.ctx.beginPath()
            this.ctx.arc(bx, by, 10, 0, 2*Math.PI)
            this.ctx.fill()
            this.ctx.restore()
        }
        this.mouseHandler.clickedNode?.drawText(this.ctx, this.nodeLabeling)

        let maxFPSRequest = Math.max(...nodeFPSRequests);
        if (maxFPSRequest > 0) {
            this.requestFramerateForCanvas(CanvasType.GENERAL,
                                           HighFPSFeature.NODE_HIGHLIGHT,
                                           maxFPSRequest);
        }
        this.ctx.restore()
    }

    drawCurrentMaxFPS(ctx, fps, name = "", vertOffset = 0) {
        ctx.save()
        ctx.fillStyle = "#AAA8";
        ctx.font = "12pt Arial";
        let content = name + fps + " FPS";
        let textMeasurement = ctx.measureText(content);
        ctx.clearRect(this.canvas.width - textMeasurement.width - 30, 25,
                      textMeasurement.width + 40, 55);
        ctx.fillText(content,
                     this.canvas.width - textMeasurement.width - 10,
                     25 + vertOffset);
        ctx.restore()
    }

    drawImportOverlay(ctx) {
        ctx.save();
        // Preenchimento
        ctx.fillStyle = "#AAFA";
        ctx.beginPath();
        ctx.rect(0, 0,
                 this.canvas.width,
                 this.canvas.height);
        ctx.fill();

        // Borda
        ctx.strokeStyle = colorFromComponents(100, 100, 255, 0.8);
        ctx.lineWidth = 15;
        ctx.setLineDash([25, 25]);
        ctx.lineDashOffset = window.performance.now()/20;
        ctx.beginPath();
        let offset = ctx.lineWidth / 2;
        ctx.rect(offset, offset,
                 this.canvas.width - 2*offset,
                 this.canvas.height - 2*offset);
        ctx.stroke();
        ctx.restore();
    }
    //endregion

    //region Animações

    lastFrameTimestamp = window.performance.now()
    frameRateRequests = {
        [CanvasType.GENERAL]: { requests: new Map(), idle: 8 },
        [CanvasType.SLOW]:    { requests: new Map(), idle: 0 },
        [CanvasType.FAST]:    { requests: new Map(), idle: 0 }
    }

    requestFramerateForCanvas(canvasType = CanvasType.GENERAL, feature, FPS) {
        if (!feature) { console.warn("Unknown High FPS feature"); return; }

        this.frameRateRequests[canvasType].requests.set(feature, FPS)
    }

    // Retorna a quantos FPS o canvas deverá ser atualizado,
    // considerando as solicitações de framerates mais altos.
    getCurrentFPS(canvasType = CanvasType.GENERAL) {
        let requestsInfo = this.frameRateRequests[canvasType];

        // Se for o canvas de uso geral e não houver nós, não atualize-o.
        if (canvasType == CanvasType.GENERAL && this.structure.nodes().next().done) {
            return 0;
        }
        // Evitando processamento se o mapa estiver vazio
        // Se não houver requests, retorne o valor de idle.
        if (requestsInfo.requests.size == 0) {
            return requestsInfo.idle;
        }

        // Obtenha o valor da maior request
        let requestValues = requestsInfo.requests.values();
        let highestFPS = Math.max(...requestValues);

        // Tenha certeza de que ela é pelo menos o valor do idle
        if (highestFPS < requestsInfo.idle) {
            highestFPS = requestsInfo.idle;
        }
        // Limpe as requests
        requestsInfo.requests.clear();

        return highestFPS;
    }


    requestCanvasRefresh(canvasType) {
        switch (canvasType) {
        case CanvasType.GENERAL:
            requestAnimationFrame(this.refreshView.bind(this));
            break;
        case CanvasType.SLOW:
            requestAnimationFrame(this.refreshSlowCanvas.bind(this));
            break;
        case CanvasType.FAST:
            requestAnimationFrame(this.refreshFastCanvas.bind(this));
            break;
        }
    }


    refreshViewTimeout;
    refreshView(timestamp) {
        let currentFPS = this.getCurrentFPS();
        if (currentFPS == 0) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawCurrentMaxFPS(this.ctx, currentFPS);
            return;
        }
        clearTimeout(this.refreshViewTimeout);
        this.refreshViewTimeout = setTimeout(() => this.requestCanvasRefresh(CanvasType.GENERAL),
                                             1000 / currentFPS);
        this.lastFrameTimestamp = timestamp;
        if (this.selectionHandler.isQuickSelection) {
            this.refreshSlowCanvas(timestamp)
        }
        let cacheDrawn = cacheFrames(currentFPS, IDLE_MAX_FPS,
                                     this.ctx, this.canvas,
                                     () => this.redrawGraph());
        if (!cacheDrawn) {
            this.redrawGraph();
            this.drawCurrentMaxFPS(this.ctx, currentFPS);
        } else {
            this.drawCurrentMaxFPS(this.ctx, currentFPS, "cache ");
        }
    }

    refreshSlowCanvas(timestamp) {
        this.slowCtx.clearRect(0, 0, this.width, this.height)
        // Chamando a cadeia de desenho de textos de cada nó
        for (let node of this.structure.nodes()) {
            if (node.index == this.mouseHandler.clickedNode?.index) {
                continue;
            }
            node.drawText(this.slowCtx, this.nodeLabeling)
        }
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            edge.textDrawChain.call(this.slowCtx, nodeA.pos, nodeB.pos,
                                    this.structure.checkEdgeBetween(nodeB, nodeA))
        }

        // Debug
        // this.slowCtx.save()
        // this.slowCtx.fillStyle = "gray"
        // this.slowCtx.fillRect( 0, 0, 50+Math.sin(timestamp/50)*25, 50)
        // this.slowCtx.restore()
    }

    refreshFastCanvas(timestamp) {
        this.fastCtx.clearRect(0, 0, this.width, this.height);
        // this.fastCtx.fillStyle = colorFromComponents(230, 230, 50, 0.25)
        // this.fastCtx.fillRect(0, 0, this.width, this.height)

        // Desenho da área de seleção
        if (this.selectionHandler.shouldDrawSelection) {
            // Envie o canvas para frente
            if (this.showingArea == false) { this.fastCanvas.style.zIndex = 10; }
            // Desenhe a área
            this.drawSelectionArea(this.fastCtx);
        } else if (this.showingArea == true) {
            // Limpe o canvas ao terminar de desenhar a área de seleção
            this.fastCtx.clearRect(0, 0, this.width, this.height);
        }
        this.showingArea = this.selectionHandler.shouldDrawSelection;

        // Desenhar aresta temporária
        if (this.mouseHandler.shouldDrawTemporaryEdge) {
            let startPos = this.mouseHandler.clickedNode?.pos;
            let endPos   = this.mouseHandler.currentMousePos;
            if (startPos == null || endPos == null) {
                console.warn("Situação estranha.");
                this.mouseHandler.shouldDrawTemporaryEdge = false;
                return;
            }
            // Envie o canvas para trás
            this.fastCanvas.style.zIndex = -2;

            this.structure.temporaryEdge.draw(this.fastCtx, startPos, endPos);
        }

        if (this.overlay) {
            setTimeout(() => this.requestCanvasRefresh(CanvasType.FAST),
                       1000 / 30);
            this.drawImportOverlay(this.fastCtx)
        }

        // Debug
        // this.fastCtx.save()
        // this.fastCtx.fillStyle = "red"
        // this.fastCtx.fillRect( 0, 50, 50+Math.sin(timestamp/50)*25, 50)
        // this.fastCtx.restore()
    }

    //endregion
}

export let g = new GraphView(canvas, slowOverlayCanvas, fastOverlayCanvas);
// g.refreshFastCanvas()
g.requestCanvasRefresh(CanvasType.GENERAL)
g.requestCanvasRefresh(CanvasType.SLOW)
g.slowCtx.fillStyle = "red"
g.slowCtx.fillRect(150, 150, 200, 200)

// testSelection(g)
// testNodeHighlights(g)
// testBasicRoutine(g)