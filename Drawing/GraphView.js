import {canvas, Tool, HighFPSFeature, backgroundGradient, overlayCanvas} from "./General.js"
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
    constructor (canvas, overlayCanvas) {
        this.canvas = canvas;
        this.overlayCanvas = overlayCanvas;
        this.overlayCanvas.style.pointerEvents = "none";

        this.ctx = canvas.getContext("2d");
        this.overlayCtx = overlayCanvas.getContext("2d");

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


        /* Eventos que resetam o idle timer com qualquer ação */
        document.addEventListener("mousedown", this._handleEvent)
        document.addEventListener("keydown", this._handleEvent)
        document.addEventListener("mousemove", this._handleEvent)
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
        switch (this.primaryTool) {
        case Tool.MOVE:
            for (let node of this.structure.nodes()) {
                this.selectionHandler.select(node);
            }
            break;
        case Tool.CONNECT:
            for (let [edge, ,] of this.structure.edges()) {
                this.selectionHandler.select(edge);
            }
            break;
        }
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
        if (this.getNodesAt(pos, true).length !== 0) {
            return false;
        }
        let newNode = new this.structure.NodeConstructor({x: pos.x, y:pos.y, colorIndex: this.nodeColorIndex++})
        let inserted = this.structure.insertNode(newNode);
        if (!inserted) { return; }

        this.redrawGraph();
        this.registerStep();
        return newNode;
    }

    moveNode(node, pos) {
        this.requestOverlayRefresh()
        this.requestHighFPS(HighFPSFeature.MOVING, 90);
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
        this.registerStep();
    }

    blurTimeout = null;
    removeBlur = () => {
        this.canvas.classList.remove("blurred");
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
        this.overlayCanvas.width = newWidth;
        this.overlayCanvas.height = newHeight;

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
        }
        this.blurTimeout = setTimeout(this.removeBlur, 250);

        this.redrawGraph()
    }

    loadSerializedGraph(serialized) {
        let deserializedGraph = Graph.deserialize(serialized);
        if (deserializedGraph) {
            this.structure = deserializedGraph;
        }
        refreshInterfaceCategories();
        this.refreshOverlay()
    }

    //endregion

    //region Desenho do Grafo
    drawSelectionArea() {
        this.overlayCtx.save();
        //this.overlayCtx.clearRect(0, 0, this.width, this.height)

        this.overlayCtx.strokeStyle = 'blue';
        this.overlayCtx.fillStyle = colorFromComponents(0, 0, 255, 0.1);
        this.overlayCtx.lineWidth = 3;

        this.selectionHandler.prepareSelectionAreaDrawing(this.overlayCtx);

        this.overlayCtx.fill();
        this.overlayCtx.stroke();

        this.overlayCtx.restore();
    }

    drawEdges() {
        // Desenhar arestas do grafo
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            edge.draw(this.ctx, nodeA.pos, nodeB.pos)
        }
        // Desenhar aresta temporária
        if (this.interactionHandler.mouse.shouldDrawTemporaryEdge) {
            let startPos = this.interactionHandler.mouse.clickedNode?.pos;
            let endPos   = this.interactionHandler.mouse.currentMousePos;
            if (startPos == null || endPos == null) {
                console.warn("Situação estranha.");
                this.interactionHandler.mouse.shouldDrawTemporaryEdge = false;
                return;
            }
            this.requestHighFPS(HighFPSFeature.CONNECTING, 90);
            this.structure.temporaryEdge.draw(this.ctx, startPos, endPos);
        }
    }
    get width() {
        if (this.canvas.width != this.overlayCanvas.width) {
            console.log(this.canvas.width, this.overlayCanvas.width)
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
            this.requestHighFPS(HighFPSFeature.NODE_HIGHLIGHT, maxFPSRequest);
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

    drawCurrentMaxFPS(fps) {
        this.ctx.save()
        this.ctx.fillStyle = "#AAA8";
        this.ctx.font = "12pt Arial";
        let content = fps + " FPS";
        let textMeasurement = this.ctx.measureText(content);
        this.ctx.fillText(content,
                     canvas.width - textMeasurement.width - 10,
                     25);
        this.ctx.restore()
    }

    //endregion

    //region Animações

    lastFrameTimestamp = window.performance.now()
    frameRateRequests = new Map()
    overlayFrameRateRequests = new Map()
    requestHighFPS(feature, FPS) {
        if (!feature) {
            console.warn("Unknown High FPS feature")
            return;
        }
        this.frameRateRequests.set(feature, FPS)
    }

    getCurrentFPS() {
        // Evitando processamento se o mapa estiver vazio
        if (this.frameRateRequests.size == 0) { return IDLE_MAX_FPS; }

        let requestValues = this.frameRateRequests.values();
        let highestFPS = Math.max(...requestValues);

        if (highestFPS < IDLE_MAX_FPS) {
            highestFPS = IDLE_MAX_FPS;
        }

        return highestFPS;
    }

    getOverlayCurrentFPS() {
        // Evitando processamento se o mapa estiver vazio
        if (this.overlayFrameRateRequests.size == 0) { return 0; }

        let requestValues = this.overlayFrameRateRequests.values();
        let highestFPS = Math.max(...requestValues);

        if (highestFPS < IDLE_MAX_FPS) {
            highestFPS = IDLE_MAX_FPS;
        }

        return highestFPS;
    }

    drawOverlayFPS(fps) {
        this.overlayCtx.save()
        this.overlayCtx.fillStyle = "#AAA8";
        this.overlayCtx.font = "12pt Arial";
        let content = fps + " oFPS";
        let textMeasurement = this.overlayCtx.measureText(content);
        this.overlayCtx.fillText(content,
                                 this.width - textMeasurement.width - 100,
                                 25);
        this.overlayCtx.restore()
    }

    requestOverlayRefresh() {
        setTimeout(() => requestAnimationFrame(this.refreshOverlay.bind(this)), 0);
    }
    // TODO: Permitir o controle do FPS do canvas de overlay
    refreshOverlay(timestamp) {
        let currentFPS = this.getOverlayCurrentFPS();
        if ( currentFPS == 0) {
            this.overlayCtx.clearRect(0, 0, this.width, this.height);
            //currentFPS = 5;
            //return;
        } else {
            setTimeout(() => requestAnimationFrame(this.refreshOverlay.bind(this)), 1000 / currentFPS);
        }
        //console.log(1)
        this.overlayCtx.clearRect(0, 0, this.width, this.height);
        for (let node of this.structure.nodes()) {
            node._drawLabel(this.overlayCtx, this.nodeLabeling, node._originalcolor)

        }
        this.overlayFrameRateRequests.clear();
        if (this.selectionHandler.shouldDrawSelection) {
            //setTimeout(() => requestAnimationFrame(this.refreshOverlay.bind(this)),
            //           1000/90);
            this.overlayCtx.save();
            //this.requestHighFPS(HighFPSFeature.SELECTING, 90);
            this.overlayFrameRateRequests.set(HighFPSFeature.SELECTING, 90)
            this.drawSelectionArea();
            this.overlayCtx.restore();
        } else if (this.showingArea == true) {
            this.overlayCtx.clearRect(0, 0, this.width, this.height);
        }
        this.showingArea = this.selectionHandler.shouldDrawSelection;
        this.drawOverlayFPS(currentFPS);
    }

    _cachingFrames = true
    _cachingTimeout = null

    _cachedFrames = []
    _currentFrame = 0
    _frameInverted = false

    // Espaçamento de frames entre coletas
    _cacheFrameSpacing = 0

    // Função de resetar a coleta de frames
    _handleEvent = () => {
        clearTimeout(this._cachingTimeout)

        this._cachingFrames = false
        this._cachedFrames = []
        this._currentFrame = 0
        this._frameInverted = false
        this._cacheFrameSpacing = 0

        this._cachingTimeout = setTimeout(() => {
            this._cachingFrames = true
        }, 5000)
    }

    // Função resposável por cachear frames quando o canvas está idle
    // Retorna true se um canvas cacheado foi desenhado e false caso contrário
    cacheFrames(currentFPS) {
        if(!this._cachingFrames) {
            return false
        }

        if(currentFPS > IDLE_MAX_FPS) {
            //console.log('greater')
            this._cachedFrames = []
            this._currentFrame = 0
            // Controla o comporamento de leitura simétrica
            this._frameInverted = false
            return false
        }

        // Número de frames idle coletados, baseado na animação de "breathing" que é simétrica e tem ~44 frames
        const numIdleFrames = 22

        // Se frames o bastante já foram cacheados
        if(this._cachedFrames.length === numIdleFrames) {
            // Os frames são lidos de forma simétrica
            if(!this._frameInverted)
            {
                this._currentFrame++
            } else {
                this._currentFrame--
            }

            // Inverte ao chegar nas pontas
            if(this._currentFrame === numIdleFrames - 1 || this._currentFrame === 0)
            {
                this._frameInverted = !this._frameInverted
            }


            let image = this._cachedFrames[this._currentFrame]
            // Se existe uma imagem cacheada e pronta
            if(image && image.complete) {
                //console.log('idle', this._currentFrame)
                this.ctx.drawImage(image, 0, 0)
                return true
            }
        // Caso contrário, coletar mais frames
        } else {
            // Desenhar o grafo antes de coletar o frame 0
            if(this._cachedFrames.length === 0) {
                this.redrawGraph()
            }

            if(this._cacheFrameSpacing === 0) {
                // Captura o canvas em uma nova imagem
                console.log('collecting')
                let image = new Image()
                image.src = this.canvas.toDataURL()
                this._cachedFrames.push(image)

                this._cacheFrameSpacing = numIdleFrames + 1
            }
            this._cacheFrameSpacing--
        }
        return false
    }

    requestViewRefresh = () => {
        requestAnimationFrame(this.refreshView.bind(this));
    }
    refreshView(timestamp) {
        let currentFPS = this.getCurrentFPS();
        setTimeout(this.requestViewRefresh, 1000/currentFPS);
        // Se não há nós, pare
        if (this.structure.nodes().next().done) { return; }
        this.frameRateRequests.clear();
        this.lastFrameTimestamp = timestamp;
        if(!this.cacheFrames(currentFPS)) {
            this.redrawGraph();
        }
        this.drawCurrentMaxFPS(currentFPS);
    }
    // This function updates every node and redraws the graph.

    //endregion
}

export let g = new GraphView(canvas, overlayCanvas);
g.refreshOverlay()
g.requestViewRefresh()

// testSelection(g)
// testNodeHighlights(g)
// testBasicRoutine(g)