import {
    canvas, Tool, HighFPSFeature, backgroundGradient, fastOverlayCanvas, slowOverlayCanvas,
    CanvasType
} from "./General.js"
import Graph from "../Structure/Graph.js"
import Edge from "../Structure/Edge.js"
import Node from "../Structure/Node.js"
import EdgeAssignedValueMixin from "../Structure/Mixins/Edge/EdgeAssignedValueMixin.js";
import {HighlightType} from "../Structure/Highlights.js";

import GraphMouseHandler from "./GraphMouseInteraction.js"
import GraphKeyboardHandler from "./GraphKeyboardInteraction.js"
import GraphSelection from "./GraphSelection.js"

import {
    colorFromComponents, getDistanceOf, refreshInterfaceCategories,
} from "../Structure/Utilities.js";
import PropertyList from "./Properties/PropertyList.js";
import {generateRandomEdges, generateRandomNodes} from "./GraphViewDebugHelper.js";
import {regularNodeRadius} from "../Structure/Node.js";

import HistoryTracker from "./HistoryTracker.js"
import {testBasicRoutine} from "./GraphViewTests.js";
import cacheFrames from "./GraphFrameCaching.js";
// Registrando componente custom
customElements.define('property-list', PropertyList)

const IDLE_MAX_FPS = 10;

const NodeLabeling = {
    NUMBERS: "numbers",
    LETTERS_RAND: "letters_randomized",
    LETTERS_ORD: "letters_ordered"
}

// Graph
class GraphView {
    overlay = false;
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
        let mouseHandler = new GraphMouseHandler(this);
        let keyboardHandler = new GraphKeyboardHandler(this);
        this.interactionHandler = { mouse: mouseHandler, keyboard: keyboardHandler }
        
        // MOUSE
        canvas.onmousedown  = mouseHandler.mouseDownEvent;
        canvas.onmousemove  = mouseHandler.mouseDragEvent;
        canvas.onmouseup    = mouseHandler.mouseUpEvent;
        canvas.onmouseleave = mouseHandler.mouseLeaveEvent;

        // Evite abrir o menu de contexto para não haver conflito com o gesto
        // de deletar nós.
        canvas.oncontextmenu = event => event.preventDefault();

        // KEYBOARD
        document.body.onkeydown = keyboardHandler.keyPressed;
        document.body.onkeyup = keyboardHandler.keyReleased;

        this.history = new HistoryTracker();
        this.history.registerStep(this.structure.clone())
        // Debugging
        // generateRandomNodes(this, 4)
        // generateRandomEdges(this, 3)
        // for (let j = 0; j < getRandomInt(0, 3); j++ ) {
        //     let r = getRandomInt(0, 3)
        //     Array.from(this.structure.nodes())[r].highlights.add(NodeHighlightType.ALGORITHM_FOCUS)
        // }
    }

    _primaryTool = Tool.MOVE;
    get primaryTool() {
        return this._primaryTool;
    }
    set primaryTool(anotherTool) {
        this._primaryTool = anotherTool;
        if (this.primaryTool !== Tool.CONNECT) {
            // Pare de atualizar a aresta temporária
            this.interactionHandler.mouse.shouldDrawTemporaryEdge = false;
        }
        this.refreshInterfaceState()
    }


    // Interaction
    /* Atualiza o tipo de grafo sendo exibido */
    updateGraphType() {

    }
    /* Atualiza o tipo de aresta exibida */
    updateEdgeType(weighed = false, colored = false, directed = false) {
        let EdgeType = Edge;
        if(weighed) {
            EdgeType = EdgeAssignedValueMixin(EdgeType)
        }
        if(colored) {
            //TODO: Mixin de edge colorido
        }
        if(directed) {
            //TODO: Mixin de edge direcionado
        }

        g.structure = g.structure.cloneAndTransform({EdgeConstructor: EdgeType})
    }

    /* Atualiza o tipo de nó exibido */
    updateNodeType() {

    }

    /* Atualiza a interface para que os botões reflitam o estado das ferramentas */
    refreshInterfaceState() {
        for(let x of document.querySelector("#tool_tray").children) {
            for (let element of x.children) {
                if(element.tagName === "INPUT" && element.value === this.primaryTool) {
                    element.click();
                }
            }
        }
        this.interactionHandler.mouse.refreshCursorStyle();
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
    selectionChanged() {
        let shouldShowDashedTools = false;
        for (let node of this.structure.nodes()) {
            if (this.selectionHandler.isSelected(node)
                && this.selectionHandler.isQuickSelection === false) {
                node.highlights.add(HighlightType.SELECTION)
                shouldShowDashedTools = true;
            } else {
                node.highlights.remove(HighlightType.SELECTION)
            }
        }

        for (let [edge, ,] of this.structure.edges()) {
            if (this.selectionHandler.isSelected(edge)) {
                edge.highlights.add(HighlightType.SELECTION)
                shouldShowDashedTools = true;
            } else {
                edge.highlights.remove(HighlightType.SELECTION)
            }
        }

        // Seleção de nós NÃO temporária
        //let hasExplicitNodeSelection = this.selectionHandler.hasSelectedNodes > 0
        //                               && this.selectionHandler.isQuickSelection === false
        //if (hasExplicitNodeSelection || this.selectionHandler.hasSelectedEdges > 0) {
        if (shouldShowDashedTools) {
            let featureIcons = Array.from(document.getElementsByClassName("feature-icon"))
            featureIcons.forEach(icon => icon.classList.add("selected"))
        } else {
            let selectedElements = Array.from(document.getElementsByClassName("selected"))
            selectedElements.forEach(element => element.classList.remove("selected"))
        }
    }

    //region Deteção de Nós e Arestas

    // TODO: Área de colisão pode ser um quadrado, checar se há 1 nó pode ser
    //       separado de obter todos os nós
    // Searches for nodes that contain the point `pos`
    // The lookup is done from the last node to the first, the inverse of the
    // drawing lookup in order to return the frontmost node.
    getNodesAt(pos, checkForConflict = false) {
        let detectedNodes = [];
        for (let node of this.structure.nodes()) {
            let radiusCheck = Math.max(node.radius-4, regularNodeRadius);
            if (checkForConflict) { radiusCheck *= 2; }

            if (   node.pos.x - radiusCheck < pos.x && node.pos.x + radiusCheck > pos.x
                && node.pos.y - radiusCheck < pos.y && node.pos.y + radiusCheck > pos.y) {
                if (checkForConflict) return [node];
                detectedNodes.push(node);
            }
        }
        return detectedNodes;
    }

    checkIfNodeAt(pos, checkForConflict = false) {

        for (let node of this.structure.nodes()) {
            let radiusCheck = Math.max(node.radius-4, regularNodeRadius);
            if (checkForConflict) { radiusCheck *= 2; }

            if (   node.pos.x - radiusCheck < pos.x && node.pos.x + radiusCheck > pos.x
                   && node.pos.y - radiusCheck < pos.y && node.pos.y + radiusCheck > pos.y) {
                return true;
            }
        }
        return false;
    }

    getEdgesAt(pos) {
        const eps = 1;
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            let edgeLength = getDistanceOf(nodeA.pos, nodeB.pos)
            let distSum = getDistanceOf(pos, nodeA.pos)
                          + getDistanceOf(pos, nodeB.pos)
            if (distSum >= edgeLength - eps
                && distSum <= edgeLength + eps) {
                return edge;
            }
        }
    }

    getNodesWithin(initialPos, finalPos) {
        let left   = Math.min(initialPos.x, finalPos.x);
        let right  = Math.max(initialPos.x, finalPos.x);
        let top    = Math.min(initialPos.y, finalPos.y);
        let bottom = Math.max(initialPos.y, finalPos.y);

        let nodesWithin = [];
        for (let node of this.structure.nodes()) {
            let nodeRadius = node.radius;
            if (   node.pos.x + nodeRadius > left && node.pos.x - nodeRadius < right
                && node.pos.y + nodeRadius > top && node.pos.y - nodeRadius < bottom) {
                nodesWithin.push(node);
            }
        }

        return nodesWithin;
    }

    getEdgesWithin(initialPos, finalPos) {
        let edgesWithin = [];
        // Passa por todas as arestas e considera contida caso
        // um dos nós esteja contido.
        let nodesWithin = new Set(this.getNodesWithin(initialPos, finalPos));
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            if (nodesWithin.has(nodeA) || nodesWithin.has(nodeB)) {
                edgesWithin.push(edge);
                edge.selected = true;
            }
        }

        // Prepara os lados da área de seleção
        let lines = [
            [initialPos,    {x: finalPos.x, y: initialPos.y}], // Top
            [{x: initialPos.x, y: finalPos.y},  finalPos],     // Bottom
            [initialPos,    {x: initialPos.x, y: finalPos.y}], // Left
            [{x: finalPos.x, y: initialPos.y},  finalPos],     // Right
        ]
        // Passa por todas as arestas restantes e considera contida caso haja
        // uma interseção entre uma das laterais da seleção e a aresta.
        // Explicação: http://jeffreythompson.org/collision-detection/line-line.php
        for (let [edge, s, e] of this.structure.uniqueEdges()) {
            if (edgesWithin.includes(edge)) continue;
            let startPos = s.pos, endPos = e.pos;
            rectSidesCheck:for (let [pointA, pointB] of lines) {
                let denominator =   (endPos.y - startPos.y) * (pointB.x - pointA.x)
                                  - (endPos.x - startPos.x) * (pointB.y - pointA.y);
                let uA = (  (endPos.x - startPos.x) * (pointA.y - startPos.y)
                          - (endPos.y - startPos.y) * (pointA.x - startPos.x))
                         / denominator;
                let uB = (  (pointB.x - pointA.x) * (pointA.y - startPos.y)
                          - (pointB.y - pointA.y) * (pointA.x - startPos.x))
                         / denominator;

                if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                    edgesWithin.push(edge);
                    break rectSidesCheck;
                }
            }
        }
        return edgesWithin;
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
    insertEdgeBetween(nodeA, nodeB) {
        let newEdge = new this.structure.EdgeConstructor();
        let inserted = this.structure.insertEdge(nodeA, nodeB, newEdge);
        if (!inserted) { return; }

        this.redrawGraph();
        this.registerStep();
        return newEdge;
    }

    removeEdgeAt(pos) {
        let edge = this.getEdgesAt(pos);
        if (!edge) { return; }

        this.selectionHandler.deselect(edge);
        this.structure.removeEdge(edge);
        this.registerStep();
    }

    snapNodesToGrid() {
        let gridCellSide = 2*regularNodeRadius + 10;
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
        if (deserializedGraph) {
            this.structure = deserializedGraph;
        }
        refreshInterfaceCategories();
        this.refreshGraph();
    }

    //endregion

    //region Desenho do Grafo
    drawSelectionArea() {
        this.fastCtx.save();

        this.fastCtx.strokeStyle = 'blue';
        this.fastCtx.fillStyle = colorFromComponents(0, 0, 255, 0.1);
        this.fastCtx.lineWidth = 3;

        this.selectionHandler.prepareSelectionAreaDrawing(this.fastCtx);

        this.fastCtx.fill();
        this.fastCtx.stroke();

        this.fastCtx.restore();
    }

    drawEdges() {
        // Desenhar arestas do grafo
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            edge.draw(this.ctx, nodeA.pos, nodeB.pos)
        }
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
    redrawGraph() {
        this.ctx.save();
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = backgroundGradient;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, canvas.width, canvas.height);
        this.ctx.fill();

        this.drawEdges();
        
        let nodeFPSRequests = [];
        for (let node of this.structure.nodes()) {
            let fpsRequest = node.draw(this.ctx, this.nodeLabeling);
            nodeFPSRequests.push(fpsRequest);
        }
        let maxFPSRequest = Math.max(...nodeFPSRequests);
        if (maxFPSRequest > 0) {
            this.requestFramerateForCanvas(CanvasType.GENERAL,
                                           HighFPSFeature.NODE_HIGHLIGHT,
                                           maxFPSRequest);
        }
        
        if (this.overlay) {
            // Preenchimento
            this.ctx.fillStyle = "#AAFA";

            this.ctx.beginPath();
            this.ctx.rect(0, 0,
                          canvas.width,
                          canvas.height);
            this.ctx.fill();

            // Borda
            this.ctx.strokeStyle = colorFromComponents(100, 100, 255, 0.8);
            this.ctx.lineWidth = 15;
            this.ctx.setLineDash([25, 25]);
            this.ctx.lineDashOffset = window.performance.now()/20;

            this.ctx.beginPath();
            let offset = this.ctx.lineWidth / 2;
            this.ctx.rect(offset, offset,
                          canvas.width - 2*offset,
                          canvas.height - 2*offset);
            this.ctx.stroke();
        }
        this.ctx.restore()
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

    getCurrentFPS(canvasType = CanvasType.GENERAL) {
        let requestsInfo = this.frameRateRequests[canvasType];
        if (canvasType == CanvasType.GENERAL && this.structure.nodes().next().done) {
            return 0;
        }
        // Evitando processamento se o mapa estiver vazio
        if (requestsInfo.requests.size == 0) {
            return requestsInfo.idle;
        }

        let requestValues = requestsInfo.requests.values();
        let highestFPS = Math.max(...requestValues);

        if (highestFPS < requestsInfo.idle) {
            highestFPS = requestsInfo.idle;
        }

        this.frameRateRequests[canvasType].requests.clear()
        return highestFPS;
    }

    drawCurrentMaxFPS(ctx, fps, name = "", vertOffset = 0) {
        ctx.save()
        ctx.fillStyle = "#AAA8";
        ctx.font = "12pt Arial";
        let content = name + fps + " FPS";
        let textMeasurement = ctx.measureText(content);
        ctx.clearRect(canvas.width - textMeasurement.width - 30, 25,
                      textMeasurement.width + 40, 55);
        ctx.fillText(content,
                     canvas.width - textMeasurement.width - 10,
                     25 + vertOffset);
        ctx.restore()
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

    refreshView(timestamp) {
        let currentFPS = this.getCurrentFPS();
        setTimeout(() => this.requestCanvasRefresh(CanvasType.GENERAL),
                   1000/currentFPS);

        // Se não há nós, pare
        if (this.structure.nodes().next().done) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawCurrentMaxFPS(this.ctx, currentFPS);
            return;
        }
        this.lastFrameTimestamp = timestamp;
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
        for (let node of this.structure.nodes()) {
            node.drawText(this.slowCtx, this.nodeLabeling)
        }
        this.slowCtx.save()
        this.slowCtx.fillStyle = "gray"
        this.slowCtx.fillRect( 0, 0, 50+Math.sin(timestamp/50)*25, 50)
        this.slowCtx.restore()
    }

    refreshFastCanvas(timestamp) {
        this.fastCtx.clearRect(0, 0, this.width, this.height)
        // this.fastCtx.fillStyle = colorFromComponents(230, 230, 50, 0.25)
        // this.fastCtx.fillRect(0, 0, this.width, this.height)
        // Desenho da área de seleção
        if (this.selectionHandler.shouldDrawSelection) {
            if (this.showingArea == false) {
                this.fastCanvas.style.zIndex = 10
            }
            this.fastCtx.save();
            this.requestFramerateForCanvas(CanvasType.FAST, HighFPSFeature.SELECTING, 90)
            this.drawSelectionArea();
            this.fastCtx.restore();
        } else if (this.showingArea == true) {
            this.fastCtx.clearRect(0, 0, this.width, this.height);
        }
        this.showingArea = this.selectionHandler.shouldDrawSelection;
        // Desenhar aresta temporária
        if (this.interactionHandler.mouse.shouldDrawTemporaryEdge) {
            let startPos = this.interactionHandler.mouse.clickedNode?.pos;
            let endPos   = this.interactionHandler.mouse.currentMousePos;
            if (startPos == null || endPos == null) {
                console.warn("Situação estranha.");
                this.interactionHandler.mouse.shouldDrawTemporaryEdge = false;
                return;
            }
            this.fastCanvas.style.zIndex = -2
            this.requestFramerateForCanvas(CanvasType.FAST, HighFPSFeature.CONNECTING, 90);
            this.structure.temporaryEdge.draw(this.fastCtx, startPos, endPos);
        }

        this.fastCtx.save()
        this.fastCtx.fillStyle = "red"
        this.fastCtx.fillRect( 0, 50, 50+Math.sin(timestamp/50)*25, 50)
        this.fastCtx.restore()
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