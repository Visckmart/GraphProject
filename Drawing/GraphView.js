import {canvas, Tool, HighFPSFeature, backgroundGradient} from "./General.js"
import Graph from "../Structure/Graph.js"
import Edge from "../Structure/Edge.js"
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
    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.structure = new Graph();
        this.nodeLabeling = NodeLabeling.LETTERS_RAND;

        // INTERACTION
        this.selectionHandler = new GraphSelection(this);
        let mouseHandler = new GraphMouseHandler(this)
        let keyboardHandler = new GraphKeyboardHandler(this)
        this.interactionHandler = { mouse: mouseHandler, keyboard: keyboardHandler }
        
        // MOUSE
        canvas.addEventListener("mousedown",
                                mouseHandler.mouseDownEvent.bind(mouseHandler));
        canvas.addEventListener("mousemove",
                                mouseHandler.mouseDragEvent.bind(mouseHandler));
        canvas.addEventListener("mouseup",
                                mouseHandler.mouseUpEvent.bind(mouseHandler));

        // KEYBOARD
        document.body.onkeydown = keyboardHandler.keyPressed.bind(keyboardHandler);
        document.body.onkeyup = keyboardHandler.keyReleased.bind(keyboardHandler);

        // Evite abrir o menu de contexto para não haver conflito com o gesto
        // de deletar nós.
        canvas.addEventListener("contextmenu", event => event.preventDefault());


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
        for (let node of this.structure.nodes()) {
            if (this.selectionHandler.isSelected(node)
                && this.selectionHandler.isQuickSelection === false) {
                node.highlights.add(HighlightType.SELECTION)
            } else {
                node.highlights.remove(HighlightType.SELECTION)
            }
        }

        for (let [edge, ,] of this.structure.edges()) {
            if (this.selectionHandler.isSelected(edge)) {
                edge.highlights.add(HighlightType.SELECTION)
            } else {
                edge.highlights.remove(HighlightType.SELECTION)
            }
        }

        // Seleção de nós NÃO temporária
        let hasExplicitNodeSelection = this.selectionHandler.hasSelectedNodes > 0
                                       && this.selectionHandler.isQuickSelection === false
        if (hasExplicitNodeSelection || this.selectionHandler.hasSelectedEdges > 0) {
            let featureIcons = Array.from(document.getElementsByClassName("feature-icon"))
            featureIcons.forEach(icon => icon.classList.add("selected"))
        } else {
            let selectedElements = Array.from(document.getElementsByClassName("selected"))
            selectedElements.forEach(element => element.classList.remove("selected"))
        }
    }

    //region Deteção de Nós e Arestas

    // Searches for nodes that contain the point `pos`
    // The lookup is done from the last node to the first, the inverse of the
    // drawing lookup in order to return the frontmost node.
    getNodesAt(pos, checkForConflict = false) {
        let detectedNodes = [];
        for (let node of this.structure.nodes()) {
            let radiusCheck = Math.max(node.radius, regularNodeRadius);
            if (checkForConflict) { radiusCheck *= 2; }

            let dx = node.pos.x - pos.x;
            let dy = node.pos.y - pos.y;
            if (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) < radiusCheck) {
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
        let leftmost   = Math.min(initialPos.x, finalPos.x)
        let rightmost  = Math.max(initialPos.x, finalPos.x)
        let topmost    = Math.min(initialPos.y, finalPos.y)
        let bottommost = Math.max(initialPos.y, finalPos.y)

        let nodesWithin = []
        for (let node of this.structure.nodes()) {
            if (   node.pos.x + node.radius > leftmost
                && node.pos.x - node.radius < rightmost
                && node.pos.y + node.radius > topmost
                && node.pos.y - node.radius < bottommost) {
                nodesWithin.push(node)
            }
        }

        return nodesWithin;
    }

    getEdgesWithin(initialPos, finalPos) {
        let nodesWithin = new Set(this.getNodesWithin(initialPos, finalPos));
        let edgesWithin = [];
        let lines = [
            [initialPos, {x: initialPos.x, y: finalPos.y}],
            [initialPos, {x: finalPos.x, y: initialPos.y}],
            [{x: finalPos.x, y: initialPos.y}, finalPos],
            [{x: initialPos.x, y: finalPos.y}, finalPos],
        ]
        for (let [edge, s, e] of this.structure.uniqueEdges()) {
            for (let idx in lines) {
                let [startPos, endPos] = lines[idx];
                let uA = ((e.pos.x - s.pos.x) * (startPos.y - s.pos.y) - (e.pos.y - s.pos.y) * (startPos.x - s.pos.x)) / ((e.pos.y - s.pos.y) * (endPos.x - startPos.x) - (e.pos.x - s.pos.x) * (endPos.y - startPos.y));
                let uB = ((endPos.x - startPos.x) * (startPos.y - s.pos.y) - (endPos.y - startPos.y) * (startPos.x - s.pos.x)) / ((e.pos.y - s.pos.y) * (endPos.x - startPos.x) - (e.pos.x - s.pos.x) * (endPos.y - startPos.y));

                // console.log(uA, uB)
                if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                    // console.log(`Hit ${s.label} ${e.label} ${idx}`)
                    edgesWithin.push(edge);
                    break;
                }
            }
        }

        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            if (nodesWithin.has(nodeA) || nodesWithin.has(nodeB)) {
                edgesWithin.push(edge);
                edge.selected = true;
            }
        }
        return edgesWithin;
    }
    //endregion

    //region Manipulação do Grafo

    insertNewNodeAt(pos) {
        if (this.getNodesAt(pos, true).length !== 0) {
            return false;
        }
        let newNode = new this.structure.NodeConstructor({x: pos.x, y:pos.y})
        let inserted = this.structure.insertNode(newNode);
        if (!inserted) { return; }

        this.redrawGraph();
        return newNode;
    }

    moveNode(node, pos) {
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
        this.selectionHandler.deselect(frontmostNode);
        this.structure.removeNode(frontmostNode);
    }

    recalculateNodePositions() {
        let widthMult = (window.innerWidth*0.75)/canvas.width;
        let heightMult = (window.innerHeight*0.95)/canvas.height;

        for (let node of this.structure.nodes()) {
            node.pos.x *= widthMult;
            node.pos.y *= heightMult;
        }
    }

    // ARESTAS
    insertEdgeBetween(nodeA, nodeB) {
        let newEdge = new this.structure.EdgeConstructor();
        let inserted = this.structure.insertEdge(nodeA, nodeB, newEdge);
        if (!inserted) { return; }

        this.redrawGraph();
        return newEdge;
    }

    removeEdgeAt(pos) {
        let edge = this.getEdgesAt(pos);
        if (!edge) {
            return;
        }
        this.selectionHandler.deselect(edge);
        this.structure.removeEdge(edge);
    }

    snapNodesToGrid() {
        let gridCellSide = 50;
        for (let node of this.structure.nodes()) {
            node.pos.x = Math.round(node.pos.x / gridCellSide) * gridCellSide;
            node.pos.y = Math.round(node.pos.y / gridCellSide) * gridCellSide;
        }
    }

    loadSerializedGraph(serialized) {
        let deserializedGraph = Graph.deserialize(serialized);
        if (deserializedGraph) {
            this.structure = deserializedGraph;
        }
        refreshInterfaceCategories();
    }

    //endregion

    //region Desenho do Grafo
    drawSelectionArea() {
        this.ctx.save();

        this.ctx.strokeStyle = 'blue';
        this.ctx.fillStyle = colorFromComponents(0, 0, 255, 0.1);
        this.ctx.lineWidth = 3;

        this.selectionHandler.prepareSelectionAreaDrawing(this.ctx);

        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
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
            // for (let [, s,e] of this.structure.uniqueEdges()) {
            //     let uA = ((e.pos.x-s.pos.x)*(startPos.y-s.pos.y) - (e.pos.y-s.pos.y)*(startPos.x-s.pos.x)) / ((e.pos.y-s.pos.y)*(endPos.x-startPos.x) - (e.pos.x-s.pos.x)*(endPos.y-startPos.y));
            //     let uB = ((endPos.x-startPos.x)*(startPos.y-s.pos.y) - (endPos.y-startPos.y)*(startPos.x-s.pos.x)) / ((e.pos.y-s.pos.y)*(endPos.x-startPos.x) - (e.pos.x-s.pos.x)*(endPos.y-startPos.y));
            //     if (this.interactionHandler.mouse.clickedNode == s || this.interactionHandler.mouse.clickedNode == e) continue;
            //     if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            //         console.log(`Hit ${s.label} ${e.label}`)
            //     }
            // }
            this.structure.temporaryEdge.draw(this.ctx, startPos, endPos);
        }
    }
    frameCount = window.performance.now();
    // This function clears the canvas and redraws it.
    redrawGraph() {
        this.ctx.save();
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = backgroundGradient;
        // console.log(this.frameCount)
        // if (this.frameCount >= 2000 && this.frameCount <= 3000) {
        //     // this.ctx.fillStyle = "red";
        //     this.selectionHandler.draggingEvent({x: 100, y: 100}, {x: 500, y: 200})
        // }
        // if (this.frameCount > 3000 && this.frameCount <= 3200) {
        //     this.selectionHandler.clearSelectionArea();
        // }
        this.frameCount = window.performance.now();
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

        if (this.selectionHandler.shouldDrawSelection) {
            this.ctx.save();
            this.requestHighFPS(HighFPSFeature.SELECTING, 90);
            this.drawSelectionArea();
            this.ctx.restore()
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

    requestHighFPS(feature, FPS) {
        if (!feature) {
            console.warn("Unknown High FPS feature")
            return;
        }
        this.frameRateRequests.set(feature, FPS)
    }

    getCurrentFPS() {
        let requestValues = this.frameRateRequests.values()
        let highestFPS = Math.max(...requestValues)

        if (highestFPS < IDLE_MAX_FPS) {
            highestFPS = IDLE_MAX_FPS
        }
        return highestFPS;
    }

    // This function updates every node and redraws the graph.
    updateAnimations(timestamp) {
        requestAnimationFrame(this.updateAnimations.bind(this));

        let currentFPS = this.getCurrentFPS()
        // console.log(currentFPS + "FPS", this.frameRateRequests)
        let timeBetweenFrames = 1000/currentFPS;
        if ((timestamp - this.lastFrameTimestamp) < timeBetweenFrames) {
            return;
        }
        this.lastFrameTimestamp = timestamp;
        this.frameRateRequests.clear();
        
        this.redrawGraph();
        this.drawCurrentMaxFPS(currentFPS);
    }

    //endregion
}

export let g = new GraphView(canvas);
g.redrawGraph();
g.updateAnimations();