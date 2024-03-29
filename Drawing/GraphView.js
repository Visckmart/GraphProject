/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
    canvas, CanvasType, fastOverlayCanvas, GraphCategory, HighFPSFeature, incrementGlobalIndex, slowOverlayCanvas, Tool
} from "./General.js"
import Graph from "../Structure/Graph.js"
import { HighlightType, NodeHighlight as NodeHighlights } from "../Utilities/Highlights.js";

import GraphMouseHandler from "./GraphMouseInteraction.js"
import GraphKeyboardHandler from "./GraphKeyboardInteraction.js"
import GraphSelection from "./GraphSelection.js"

import { colorFromComponents, getDistanceOf, isTouchEnvironment } from "../Utilities/Utilities.js";
import PropertyList from "../Structure/Properties/PropertyList.js";
import { regularNodeRadius } from "../Structure/Node.js";

import HistoryTracker from "../Utilities/HistoryTracker.js"
import cacheFrames from "./GraphFrameCaching.js";
// import { refreshInterfaceCategories } from "./Interaction.js";
import {
    checkLinePointCollision, checkRectangleSquareCollision, checkSquarePointCollision, createRectangleChecker,
    translateWithAngle
} from "./GeometryHelper.js";
import { GraphInterface } from "./GraphInterface.js";
// Registrando componente custom
customElements.define('property-list', PropertyList)
const toolTrayElement = document.querySelector("#tool_tray")
const IDLE_MAX_FPS = 10;

const NodeLabeling = {
    NUMBERS: "numbers",
    LETTERS_RAND: "letters_randomized",
    LETTERS_ORD: "letters_ordered"
}

export let isMobile = window.innerWidth < 450 || window.innerHeight < 450;

// isMobile = !isMobile

// Graph
export class GraphView {
    constructor (delegate, canvas, slowCanvas, fastCanvas, interactive = true) {
        this.delegate = delegate;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.fastCanvas = fastCanvas;
        this.fastCanvas.style.pointerEvents = "none";
        this.fastCtx = this.fastCanvas.getContext("2d");

        this.slowCanvas = slowCanvas;
        this.slowCanvas.style.pointerEvents = "none";
        this.slowCtx = this.slowCanvas.getContext("2d");

        this.background = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        this.background.addColorStop(0, "#E5E0FF");
        this.background.addColorStop(1, "#FFE0F3");
        this.ctx.imageSmoothingEnabled = false;

        this.structure = new Graph();
        this.nodeLabeling = NodeLabeling.LETTERS_RAND;

        // INTERACTION
        this.selectionHandler = new GraphSelection(this, false);
        this.mouseHandler = new GraphMouseHandler(this);
        this.keyboardHandler = new GraphKeyboardHandler(this);
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (event) => {
                this.darkModeChanged(event.matches);
            });

        if (isMobile == false) {
            // Mouse
            if (isTouchEnvironment()) {
                canvas.ontouchstart = this.mouseHandler.mouseDownEvent;
                canvas.ontouchmove = this.mouseHandler.mouseMoveEvent;
                canvas.ontouchend = this.mouseHandler.mouseUpEvent;
            } else {
                canvas.onmousedown = this.mouseHandler.mouseDownEvent;
                canvas.onmousemove = this.mouseHandler.mouseMoveEvent;
                canvas.onmouseup = this.mouseHandler.mouseUpEvent;
                canvas.onmouseleave = this.mouseHandler.mouseLeaveEvent;
                canvas.onmouseout = this.mouseHandler.mouseLeaveEvent;
            }

            // Evite abrir o menu de contexto para não haver conflito com o gesto
            // de deletar nós.
            canvas.oncontextmenu = event => event.preventDefault();

            // Keyboard
            document.body.onkeydown = this.keyboardHandler.keyPressed;
            document.body.onkeyup = this.keyboardHandler.keyReleased;
        } else {
            canvas.ontouchstart = this.mouseHandler.mouseDownEvent;
            canvas.ontouchmove = this.mouseHandler.mouseMoveEvent;
            canvas.ontouchend = this.mouseHandler.mouseUpEvent;
        }
        // HISTORY
        this.history = new HistoryTracker();
        this.history.didChange = this.historyDidChange.bind(this);
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

    historyDidChange(isNewStep) {
        if (!isNewStep) {
            this.structure = this.history.getCurrentStep();
            this.refreshGraph();
            this.selectionHandler.clear();
        }
        let serializedGraph = this.structure.serialize();
        let shareLink = window.location.protocol + "//"
                        + window.location.host + window.location.pathname
                        + "?graph=" + serializedGraph;
        let exportLinkButton = document.getElementById("exportLink");
        if (exportLinkButton) {
            exportLinkButton.href = shareLink;
        } else {
            console.warn("Botão de exportar como link não foi encontrado.");
        }
    }

    darkModeChanged(isActive) {
        if (isActive) {
            this.background = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            this.background.addColorStop(0, "#B8B4CC");
            this.background.addColorStop(1, "#CCB4C3");
        } else {
            this.background = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            this.background.addColorStop(0, "#E5E0FF");
            this.background.addColorStop(1, "#FFE0F3");
        }
    }

    background;
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
        this.keyboardHandler.lastToolChoice = this.primaryTool;
        this.delegate.didChangeTool(anotherTool);
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
        // TODO: Melhorar
        g.structure.categories = new Set(categories);
        g.refreshGraph();
        this.registerStep();
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

    /** Obtém os nós que estão em uma determinada posição. **/
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


    /** Checa se há ao menos 1 nó em uma determinada posição. **/
    checkIfNodeAt(pos, checkForConflict = false, exceptionIndex = null) {
        for (let node of this.structure.nodes()) {
            if (node.index == exceptionIndex) continue;

            let radiusCheck = Math.max(node.radius-4, regularNodeRadius);
            if (checkForConflict) { radiusCheck *= 2; }

            let collided = checkSquarePointCollision(
                node.pos, radiusCheck*2, pos)
            if (collided) { return node; }
        }
        return false;
    }

    /** Obtém as arestas que estão em uma determinada posição. **/
    getEdgesAt(pos) {
        let allEdges = []

        let undirected = this.structure.categories.has(GraphCategory.DIRECTED_EDGES) == false
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            let straightLine = !this.structure.checkEdgeBetween(nodeB, nodeA)

            if (undirected || straightLine) {
                let collided = checkLinePointCollision(
                    nodeA.pos, nodeB.pos, 2, pos
                )
                if (collided) { allEdges.push(edge); }
            } else {
                let angle = Math.atan2(nodeB.pos.y - nodeA.pos.y, nodeB.pos.x - nodeA.pos.x) - Math.PI / 2;

                let offsetA = translateWithAngle(nodeA.pos, angle, 25, 25)
                let offsetB = translateWithAngle(nodeB.pos, angle, 25, 25)
                let collided = checkLinePointCollision(
                    offsetA, offsetB, 2, pos
                )
                if (collided) { allEdges.push(edge); }
            }
        }
        return allEdges;
    }

    /** Obtém os nós que estão em uma determinada área. **/
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

    /** Obtém as arestas que tocam ou estão contidas em uma determinada área. **/
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
        this.history.registerStep(this.structure.clone());
    }

    nodeColorIndex = 0;
    insertNewNodeAt(pos, automated = false) {
        if (this.checkIfNodeAt(pos, true)) {
            return false;
        }
        let newNode = new this.structure.NodeConstructor({x: pos.x, y:pos.y, colorIndex: this.nodeColorIndex++})
        let inserted = this.structure.insertNode(newNode);
        if (!inserted) { return; }
        incrementGlobalIndex();

        this.refreshGraph();
        if (!automated) this.registerStep();
        return newNode;
    }

    shouldRefreshCollisions = true;
    moveNode(node, pos) {
        // this.requestCanvasRefresh(CanvasType.FAST)
        this.shouldRefreshCollisions = true;
        node.pos = pos;
        this.requestFramerateForCanvas(CanvasType.GENERAL, HighFPSFeature.MOVING, 90);
        this.requestCanvasRefresh(CanvasType.SLOW)
    }

    removeNodeAt(pos, automated = false) {
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
        if (!automated) this.registerStep();
    }

    // ARESTAS
    insertEdgeBetween(nodeA, nodeB, refresh = true) {
        if(this.structure.checkEdgeBetween(nodeA, nodeB)) {
            if (refresh) {
                console.error('Já existe uma aresta entre os nós.')
            }
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
        this.refreshGraph();
        this.registerStep();
    }

    snapNodesToGrid(nodes) {
        let gridCellSide = 2*regularNodeRadius + 20;
        for (let node of nodes ?? this.structure.nodes()) {
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
        let scaleFactor = this.backingScale(this.canvas.getContext("2d"));
        let originalWidth = this.canvas.width;
        let originalHeight = this.canvas.height;

        // Ajustar tamanho
        let canvasArea = document.getElementById("canvasArea");
        let newWidth = canvasArea.clientWidth * scaleFactor;
        let newHeight = canvasArea.clientHeight * scaleFactor;
        this.canvas.style.width = canvasArea.clientWidth;
        this.canvas.style.height = canvasArea.clientHeight;
        this.fastCanvas.style.width = canvasArea.clientWidth;
        this.fastCanvas.style.height = canvasArea.clientHeight;
        this.slowCanvas.style.width = canvasArea.clientWidth;
        this.slowCanvas.style.height = canvasArea.clientHeight;
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.fastCanvas.width = newWidth;
        this.fastCanvas.height = newHeight;
        this.slowCanvas.width = newWidth;
        this.slowCanvas.height = newHeight;
        this.background = this.ctx.createLinearGradient(0, 0, canvasArea.clientWidth, 0);
        this.background.addColorStop(0, "#E5E0FF");
        this.background.addColorStop(1, "#FFE0F3");
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
            if (window.performance.now() > 1000) {
                this.canvas.classList.add("blurred");
                this.slowCanvas.classList.add("blurred");
            }
        }
        this.blurTimeout = setTimeout(this.removeBlur, 250);

        this.shouldRefreshCollisions = true;
        this.refreshGraph();
    }
    backingScale(context) {
        if (isMobile) { return 1; }
        // return 0.5;
        // return 2;
        if ('devicePixelRatio' in window) {
            if (window.devicePixelRatio > 1) {
                return window.devicePixelRatio;
            }
        }
        return 1;
    }
    refreshGraph() {
        this.requestCanvasRefresh(CanvasType.GENERAL);
        this.requestCanvasRefresh(CanvasType.SLOW);
    }

    loadSerializedGraph(serialized) {
        let deserializedGraph = Graph.deserialize(serialized);
        if (!deserializedGraph) { return false; }
        if (isMobile) {
            deserializedGraph.stretchToFill();
            document.getElementById("shareModal").style.display = "none";
        }

        this.structure = deserializedGraph;
        // refreshInterfaceCategories();
        this.recalculateLayout();
        this.refreshGraph();
        this.registerStep();
        return true;
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

    overlappingNodes = new Set()

    // This function clears the canvas and redraws it.
    redrawGraph(background = false) {
        if (this.processingScreenshot && background == false) return;
        this.darkModeChanged(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        this.ctx.save();

        if (isMobile) {
            if (this.mouseHandler.touchDownTime && window.performance.now() - this.mouseHandler.touchDownTime > 500) {
                let shareModal = document.getElementById("shareModal")
                shareModal.style.display = "flex";
                this.mouseHandler.touchDownTime = null;
            }
            // return;
        }
        // TODO: Esse if é meio gambiarra, o fundo deveria ser transparente
        //       o tempo todo, e o cache deveria saber lidar com isso.
        if (background == false && !this.selectionHandler.shouldDrawSelection) {
            this.ctx.save();
            this.ctx.resetTransform();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        } else {
            this.ctx.fillStyle = this.background;
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fill();
        }

        // Desenhar arestas do grafo
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            edge.draw(this.ctx, nodeA.pos, nodeB.pos, window.performance.now(),
                      this.structure.checkEdgeBetween(nodeB, nodeA))
        }

        let nodeFPSRequests = [];
        if (this.shouldRefreshCollisions) {
            this.overlappingNodes.clear();
            for (let node of this.structure.nodes()) {
                for (let otherNode of this.structure.nodes()) {
                    if (node == otherNode) { continue; }
                    let collided = checkSquarePointCollision(
                        node.pos, 70, otherNode.pos
                    )
                    if (collided) {
                        this.overlappingNodes.add(node)
                        this.overlappingNodes.add(otherNode)
                    }
                }
            }
        }

        for (let node of this.structure.nodes()) {
            nodeFPSRequests.push(
                node.draw(this.ctx, this.background)
            );
            if (this.overlappingNodes.has(node)
                || this.mouseHandler.clickedNode?.index == node.index) {
                node.drawText(this.ctx, this.background, this.nodeLabeling)
            }
        }


        this.shouldRefreshCollisions = false;
        for (let [bx, by] of this.debugBalls) {
            this.ctx.save()
            this.ctx.fillStyle = "red"
            this.ctx.beginPath()
            this.ctx.arc(bx, by, 10, 0, 2*Math.PI)
            this.ctx.fill()
            this.ctx.restore()
        }
        // this.mouseHandler.clickedNode?.drawText(this.ctx, this.nodeLabeling)

        let maxFPSRequest = Math.max(...nodeFPSRequests);
        if (maxFPSRequest > 0) {
            this.requestFramerateForCanvas(CanvasType.GENERAL,
                                           HighFPSFeature.NODE_HIGHLIGHT,
                                           maxFPSRequest);
        }
        this.ctx.restore()
    }

    drawCurrentMaxFPS(ctx, fps, name = "", vertOffset = 0) {
        // return;
        ctx.save()
        ctx.resetTransform();
        ctx.fillStyle = "#AAA8";
        ctx.font = "12pt Arial";
        let content = name + fps + " FPS";
        let textMeasurement = ctx.measureText(content);
        ctx.fillText(content,
                     this.canvas.width - textMeasurement.width - 10,
                     25 + vertOffset);
        ctx.restore();
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
        if (canvasType == CanvasType.GENERAL && this.structure.nodes().next().done
            && this.mouseHandler.touchDownTime == null) {
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
        if (isMobile) {
            this.ctx.save();
            this.ctx.resetTransform();
            this.slowCtx.clearRect(0, 0, this.width, this.height);
            this.ctx.restore();
        } else {
            this.slowCtx.clearRect(0, 0, this.width, this.height);
        }
        // Chamando a cadeia de desenho de textos de cada nó
        for (let node of this.structure.nodes()) {
            if (this.overlappingNodes.has(node)
                || node.index == this.mouseHandler.clickedNode?.index) {
                continue;
            }
            node.drawText(this.slowCtx, this.background, this.nodeLabeling)
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

// export let g = new GraphView();
let tray = document.querySelector("#tool_tray");
let gi = new GraphInterface([canvas, slowOverlayCanvas, fastOverlayCanvas], tray);
export let g = gi.view
// export let g = gi;
// g.refreshFastCanvas()
g.requestCanvasRefresh(CanvasType.GENERAL)
g.requestCanvasRefresh(CanvasType.SLOW)
g.slowCtx.fillStyle = "red"
g.slowCtx.fillRect(150, 150, 200, 200)

// testSelection(g)
// testNodeHighlights(g)
// testBasicRoutine(g)