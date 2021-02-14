import { canvas, Tool, HighFPSFeature } from "./General.js"
import Graph from "../Structure/Graph.js"
import Edge from "../Structure/Edge.js"
import EdgeAssignedValueMixin from "../Structure/Mixins/Edge/EdgeAssignedValueMixin.js";
import {HighlightType} from "../Structure/Highlights.js";

import GraphMouseHandler from "./GraphMouseInteraction.js"
import GraphKeyboardHandler from "./GraphKeyboardInteraction.js"
import GraphSelection from "./GraphSelection.js"

import {
    backgroundGradient, colorFromComponents, getDistanceOf, refreshInterfaceCategories,
} from "../Structure/Utilities.js";
import PropertyList from "./Properties/PropertyList.js";

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
        // integrateComponent(this, GraphKeyboardInteraction(this))
        
        // MOUSE
        canvas.addEventListener("mousedown",
            mouseHandler.mouseDownEvent.bind(mouseHandler)
        );
        canvas.addEventListener("mousemove",
            mouseHandler.mouseDragEvent.bind(mouseHandler)
        );
        canvas.addEventListener("mouseup",
            mouseHandler.mouseUpEvent.bind(mouseHandler)
        );

        // KEYBOARD
        document.body.onkeydown = keyboardHandler.keyPressed.bind(keyboardHandler);
        document.body.onkeyup = keyboardHandler.keyReleased.bind(keyboardHandler);

        // Evite abrir o menu de contexto para não haver conflito com o gesto
        // de deletar nós.
        canvas.addEventListener("contextmenu", event => event.preventDefault());


        // Debugging
        // this.generateRandomNodes(4)
        // this.generateRandomEdges(3)
        // for (let j = 0; j < getRandomInt(0, 3); j++ ) {
        //     let r = getRandomInt(0, 3)
        //     Array.from(this.structure.nodes())[r].addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        // }

    }

    generateRandomNodes(quantity) {
        let i = 0
        while (i < quantity) {
            let x = Math.random()*70+5
            let y = Math.random()*20+5
            x *= 10
            y *= 10
            if (this.getNodesAt({x: x, y: y}, true)[0] == null) {
                i++;
                this.insertNewNodeAt({x: x, y: y})
            }
        }
    }

    generateRandomEdges(quantity) {
        let i = 0
        for (let nodeA of this.structure.nodes()) {
            for (let nodeB of this.structure.nodes()) {
                if (i >= quantity) return;
                let x = Math.random() < 0.5
                if (x) {
                    i++
                    this.insertEdgeBetween(nodeA, nodeB)
                }
            }
        }
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

    changeTool(tool) {
        this.primaryTool = tool;
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
                    element.click()
                }
            }
        }
        this.interactionHandler.mouse.refreshCursorStyle()
    }

    selectAllNodes() {
        this.selectionHandler.selectMultiple(Array.from(this.structure.nodes()));
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
            let radiusCheck;
            if (checkForConflict) { radiusCheck = Math.max(node.radius, 28) * 2; }
            else                  { radiusCheck = Math.max(node.radius, 28); }
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
            let lineLength = getDistanceOf(nodeA.pos, nodeB.pos)
            let distA = getDistanceOf(pos, nodeA.pos)
            let distB = getDistanceOf(pos, nodeB.pos)
            if (distA + distB >= lineLength-eps && distA + distB <= lineLength + eps) {
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

        return nodesWithin
    }

    getEdgesWithin(initialPos, finalPos) {
        let nodesWithin = new Set(this.getNodesWithin(initialPos, finalPos));
        let edgesWithin = [];

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
        this.structure.insertNode(newNode);
        this.redrawGraph();
        return newNode;
    }

    moveNode(node, pos) {
        this.requestHighFPS(HighFPSFeature.MOVING, 90);
        node.pos = pos;
    }

    insertEdgeBetween(nodeA, nodeB) {
        return this.structure.insertEdgeBetween(nodeA, nodeB);
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

    removeEdgeAt(pos) {
        let edge = this.getEdgesAt(pos);
        if (!edge) {
            return;
        }
        this.selectionHandler.deselect(edge);
        this.structure.removeEdge(edge);
    }

    // TODO: Organizar protótipo de recurso snap to grid
    //region
    adX = null;
    adY = null;
    averageDistance() {
        let totalX = 0;
        let totalY = 0;
        let count = 0;
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            let distX = Math.abs(nodeA.pos.x - nodeB.pos.x)
            let distY = Math.abs(nodeA.pos.y - nodeB.pos.y)
            // console.log(`${nodeA.label} – ${Math.round(dist)} (${edge.assignedValue}) – ${nodeB.label}`)
            totalX += distX;
            totalY += distY;
            count += 1;
        }
        console.log(totalX, count, totalX/count)
        console.log(totalY, count, totalY/count)
        this.adX = Math.min(Math.abs(totalX/count), 50);
        this.adY = Math.abs(totalY/count)/2;
    }
    //endregion

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
            edge.draw(nodeA.pos, nodeB.pos)
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
            this.structure.temporaryEdge.draw(startPos, endPos);
        }
    }

    // This function clears the canvas and redraws it.
    redrawGraph() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = backgroundGradient;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, canvas.width, canvas.height);
        this.ctx.fill();
        
        this.drawEdges();
        
        let nodeFPSRequests = [];
        for (let node of this.structure.nodes()) {
            let fpsRequest = node.draw(this.nodeLabeling);
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

        // TODO: Parte do protótipo do recurso snap to grid
        //region
        if (this.adX && this.adY) {
            let cols = canvas.width/this.adX
            let rows = canvas.height/this.adY
            console.log(cols, rows)
            // for (let col = 0; col < cols; col++) {
            //     this.ctx.beginPath();
            //     this.ctx.moveTo(this.adX*col, 0);
            //     this.ctx.lineTo(this.adX*col, canvas.height);
            //     this.ctx.stroke();
            // }
            // for (let row = 0; row < rows; row++) {
            //     this.ctx.beginPath();
            //     this.ctx.moveTo(0, this.adY*row);
            //     this.ctx.lineTo(canvas.width, this.adY*row);
            //     this.ctx.stroke();
            // }
            // let node = this.structure.nodes().next().value
            for (let node of this.structure.nodes()) {
                let roundedX = Math.round(node.pos.x / this.adX)
                let roundedY = Math.round(node.pos.y / this.adY)
                // console.log(node.label, node.pos, roundedX, roundedY)
                node.pos = {x: roundedX * this.adX, y: roundedY * this.adY}
            }
        }
        //endregion
        
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
        this.drawCurrentMaxFPS(currentFPS)
    }

    //endregion
}

export let g = new GraphView(canvas);
g.redrawGraph();
g.updateAnimations();