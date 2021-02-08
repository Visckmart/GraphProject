import { canvas, ctx, Tool, HighFPSFeature } from "./General.js"
import { Node } from "../Structure/Node.js"
import Edge from "../Structure/Edge.js"
import Graph from "../Structure/Graph.js"

import GraphMouseHandler from "./GraphMouseInteraction.js"
import GraphKeyboardHandler from "./GraphKeyboardInteraction.js"
import GraphSelection from "./GraphSelection.js"

import EdgeAssignedValueMixin from "../Structure/Mixins/Edge/EdgeAssignedValueMixin.js";


import PropertyList from "./Properties/PropertyList.js";
// Registrando componente custom
customElements.define('property-list', PropertyList)

const IDLE_MAX_FPS = 10;
const INTERACTION_MAX_FPS = 90;

const NodeLabeling = {
    NUMBERS: "numbers",
    LETTERS_RAND: "letters_randomized",
    LETTERS_ORD: "letters_ordered"
}

const transparentLabelGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
transparentLabelGradient.addColorStop(0, "#E5E0FF");
transparentLabelGradient.addColorStop(1, "#FFE0F3");

// Graph
class GraphView {
    overlay = false;
    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.structure = new Graph();
        this.nodeLabeling = NodeLabeling.LETTERS_RAND;

        // INTERACTION
        this.selectionHandler = new GraphSelection(ctx, this.structure, this);
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
            if (this.getNodeIndexAt({x: x, y: y}, true)[0] == null) {
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
        if (this.primaryTool != Tool.CONNECT) {
            // Pare de atualizar a aresta temporária
            this.interactionHandler.mouse.shouldDrawTemporaryEdge = false;
        }
        this.refreshInterfaceState()
    }

    changeTool(tool) {
        this.primaryTool = tool
    }


    // Interaction
    /* Atualiza o tipo de grafo sendo exibido */
    updateGraphType() {

    }
    /* Atualiza o tipo de aresta exibida */
    updateEdgeType(weighed = false, colored = false, directed = false) {
        let EdgeType = Edge
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

    // TODO: Organizar
    refreshMenu(numberOfSelectedNodes, numberOfSelectedEdges) {
        let settingsList = ["GraphSettings", "NodeSettings", "EdgeSettings"]
        for (let settingsID of settingsList) {
            let s = document.getElementById(settingsID)
            s.style.display = "none"
        }
        let showSettings;
        if (numberOfSelectedNodes == 1 &&
            this.selectionHandler.temporarySelection === false &&
            !this.selectionHandler.drawingSelection) {
            showSettings = document.getElementById("NodeSettings")
            /*
            // console.log("b")
            let selectionHandler = this.selectionHandler

            let labelInput = document.getElementById("label")
            labelInput.value = this.selectionHandler.selectedNodes[0].label
            labelInput.oninput = function(input) {
                selectionHandler.selectedNodes[0].label = input.target.value
            }
            setTimeout(function () { labelInput.focus(); labelInput.select() }, 0);

            let colorInput = document.getElementById("color")
            colorInput.value = this.selectionHandler.selectedNodes[0].color
            colorInput.oninput = function(input) {
                selectionHandler.selectedNodes[0]._originalcolor = input.target.value
            } */
            let selectedNode = this.selectionHandler.selectedNodes[0]
            let element = document.getElementById('NodeProperties')
            // TODO: Pegar algoritmo correto
            element.updateProperties(selectedNode, 'Dijkstra')
        } else if (numberOfSelectedEdges == 1 && !this.selectionHandler.drawingSelection) {
            // console.log("a")
            showSettings = document.getElementById("EdgeSettings")

            let selectedEdge = this.selectionHandler.selectedEdges[0]
            let element = document.getElementById('EdgeProperties')
            element.updateProperties(selectedEdge, 'Dijkstra')
        } else {
            showSettings = document.getElementById("GraphSettings")
        }
        showSettings.style.display = "block"

    }

    selectAllNodes() {
        this.selectionHandler.selectedNodes = Array.from(this.structure.nodes())
    }

    // Node Handling

    // Searches for nodes that contain the point `pos`
    // The lookup is done from the last node to the first, the inverse of the
    // drawing lookup in order to return the frontmost node.
    getNodeIndexAt(pos, checkForConflict = false) {
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
    getDistanceOf(A, B) {
        return Math.sqrt(Math.pow(Math.abs(B.x-A.x), 2) + Math.pow(Math.abs(B.y-A.y), 2))
    }
    checkEdgeCollision(pos) {
        // console.log(pos)
        const eps = 1
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            // console.log("e", edge)
            let lineLength = this.getDistanceOf(nodeA.pos, nodeB.pos)
            let distA = this.getDistanceOf(pos, nodeA.pos)
            let distB = this.getDistanceOf(pos, nodeB.pos)
            if (distA + distB >= lineLength-eps && distA + distB <= lineLength + eps) {
                return edge
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
        // console.trace()
        let nodesWithin = new Set(this.getNodesWithin(initialPos, finalPos))

        let edgesWithin = []
        for (let [edge, nodeA, nodeB] of this.structure.uniqueEdges()) {
            if (nodesWithin.has(nodeA) || nodesWithin.has(nodeB)) {
                edgesWithin.push(edge)
                edge.selected = true
            }
        }
        return edgesWithin
    }

    insertNewNodeAt(pos) {
        if (this.getNodeIndexAt(pos, true).length != 0) {
            return false;
        }
        let newNode = new this.structure.NodeConstructor({x: pos.x, y:pos.y})
        this.structure.insertNode(newNode)
        this.redrawGraph();
        return newNode;
    }

    moveNode(node, pos) {
        this.requestHighFPS(HighFPSFeature.MOVING, 90)
        // console.log(node, pos)
        node.pos = pos;
    }

    insertEdgeBetween(nodeA, nodeB) {
        this.structure.insertEdgeBetween(nodeA, nodeB)
    }

    removeNodeAt(pos) {
        let nodes = this.getNodeIndexAt(pos)
        if (nodes.length == 0) {
            return;
        }
        let frontmostNode = nodes[0]
        for (let node of nodes) {
            if (node.index > frontmostNode.index) {
                frontmostNode = node
            }
        }
        this.structure.removeNode(frontmostNode)
        this.selectionHandler.removeSelectionFrom(frontmostNode)
    }
    
    // s1 = 10
    // s2 = 10
    // selectionPrototyping(a, b) {
    //     // console.log(a, b)
    //     this.s1 = a/10
    //     this.s2 = b/10
    // }

    drawEdges() {
        for (let [edge, nodeIndexA, nodeIndexB] of this.structure.uniqueEdges()) {
            edge.draw(nodeIndexA.pos, nodeIndexB.pos)
        }
        if (this.interactionHandler.mouse.shouldDrawTemporaryEdge) {
            let a = this.getNodeIndexAt(this.interactionHandler.mouse.clickPosition)[0]
            let b = this.interactionHandler.mouse.currentMousePos
            if (a == null || b == null) {
                console.warn("Situação estranha.")
                this.interactionHandler.mouse.shouldDrawTemporaryEdge = false;
                return;
            }
            this.requestHighFPS(HighFPSFeature.CONNECTING, 90)
            this.structure.createTemporaryEdge().draw(a.pos, b);
        }
    }

    drawCurrentMaxFPS(fps) {
        ctx.fillStyle = "#AAA8";
        ctx.font = "12pt Arial";
        let content = fps + " FPS"
        let textMeasurement = ctx.measureText(content)
        ctx.fillText(content, canvas.width-textMeasurement.width/2 - 15, 20)
    }

    // This function clears the canvas and redraws it.
    redrawGraph() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = transparentLabelGradient;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill()
        
        this.drawEdges()
        
        let maxFPSRequest = 0;
        for (let node of this.structure.nodes()) {
            let fpsRequest = node.draw(this.nodeLabeling);
            maxFPSRequest = Math.max(maxFPSRequest, fpsRequest)
        }
        if (maxFPSRequest > 0) {
            this.requestHighFPS(HighFPSFeature.NODE_HIGHLIGHT, maxFPSRequest);
        }

        if (this.selectionHandler.drawingSelection) {
            this.selectionHandler.drawSelectionArea()
            this.requestHighFPS(HighFPSFeature.SELECTING, 90);
            // console.log(1)
        }
        
        if (this.overlay) {
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#AAFA"
            ctx.fill();
        }
    }


    // Animations

    lastFrameTimestamp = window.performance.now()
    frameRateRequests = new Map()

    requestHighFPS(feature, FPS) {
        if (feature == undefined) {
            console.warn("Unknown High FPS feature")
            return;
        }
        this.frameRateRequests.set(feature, FPS)
    }
    
    getCurrentFPS() {
        let highestFPS = Math.max(...Array.from(this.frameRateRequests.values()))

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
    
}

export let g = new GraphView(canvas);
g.redrawGraph();
g.updateAnimations();