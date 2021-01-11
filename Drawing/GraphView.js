import { canvas, ctx, Tool, HighFPSFeature } from "./General.js"
import {Node, NodeHighlightType} from "../Structure/Node.js"
import Edge from "../Structure/Edge.js"
import UndirectedGraph from "../Structure/UndirectedGraph.js"

import GraphMouseHandler from "./GraphMouseInteraction.js"
import GraphKeyboardHandler from "./GraphKeyboardInteraction.js"
import GraphSelection from "./GraphSelection.js"

const nodeBorderWidth = 2;
const nodeBorderColor = "transparent";

const edgeWidth = 3;

const IDLE_MAX_FPS = 10;
const INTERACTION_MAX_FPS = 90;

const NodeLabeling = {
    NUMBERS: "numbers",
    LETTERS_RAND: "letters_randomized",
    LETTERS_ORD: "letters_ordered"
}

function integrateComponent(original, newComponent) {
    // Associa as variáveis e os métodos ao objeto original
    Object.assign(original, newComponent)
    // Associa getters e setters ao objeto original
    for (let property of Object.getOwnPropertyNames(newComponent)) {
        let propertyDescriptor = Object.getOwnPropertyDescriptor(newComponent, property)
        if (propertyDescriptor.get != null || propertyDescriptor.set != null) {
            Object.defineProperty(original, property, propertyDescriptor)
        }
    }
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}
let t0 = window.performance.now()
// Graph
class GraphView {

    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // INTERACTION
        this.selectionHandler = new GraphSelection(canvas, this.structure);
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
        // Evite abrir o menu de contexto para não haver conflito com o gesto
        // de deletar nós.
        canvas.addEventListener("contextmenu", event => event.preventDefault());

        // KEYBOARD

        document.body.onkeydown = keyboardHandler.keyPressed.bind(keyboardHandler);
        document.body.onkeyup = keyboardHandler.keyReleased.bind(keyboardHandler);

        // Debugging
        this.generateRandomNodes(5)
        // for (let j = 0; j < getRandomInt(0, 4); j++ ) {
        //     let r = getRandomInt(0, 9)
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

    _primaryTool = Tool.MOVE;
    get primaryTool() {
        return this._primaryTool;
    }
    set primaryTool(anotherTool) {
        this._primaryTool = anotherTool;
        this.refreshInterfaceState()
    }

    structure = new UndirectedGraph();
    highlightedEdges = new Map();
    nodeLabeling = NodeLabeling.LETTERS_RAND;


    // Interaction

    /* Atualiza a interface para que os botões reflitam o estado das ferramentas */
    refreshInterfaceState() {
        for(let element of document.querySelector("#tool_tray").children) {
            if(element.tagName === "INPUT" && element.value === this.primaryTool) {
                element.click()
            }
        }
        this.interactionHandler.mouse.refreshCursorStyle()
    }

    selectAllNodes() {
        this.selectionHandler.selectedNodes = Array.from(this.structure.nodes())
    }

    changeTool(tool) {
        this.primaryTool = tool
    }

    useTool(tool) {
        switch(tool) {
            case Tool.CONNECT_ALL:
                g.connectAllEdges()
                break;
            case Tool.DISCONNECT_ALL:
                g.removeAllEdges()
                break;
        }
    }

    // Node Handling

    // Searches for nodes that contain the point `pos`
    // The lookup is done from the last node to the first, the inverse of the
    // drawing lookup in order to return the frontmost node.
    getNodeIndexAt(pos, checkForConflict = false) {
        let detectedNodes = [];
        for (let node of this.structure.nodes()) {
            let radiusCheck;
            if (checkForConflict) { radiusCheck = node.radius * 2; }
            else                  { radiusCheck = node.radius; }
            let dx = node.pos.x - pos.x;
            let dy = node.pos.y - pos.y;
            if (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) < radiusCheck) {
                detectedNodes.push(node);
            }
        }
        return detectedNodes;
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

    insertNewNodeAt(pos) {
        // if (this.getNodeIndexAt(pos, true).length != 0) {
        //     return false;
        // }
        // let newLabel = String.fromCharCode(Math.floor(Math.random()*26)+65)
        let newNode = new Node(pos.x, pos.y)
        this.structure.insertNode(newNode)
        Array.from(this.structure.nodes())[0].removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        this.redrawGraph();
        return newNode;
    }

    connectAllEdges() {
        let nodesToConnect;
        if (this.multipleSelectedNodes.length > 0) {
            nodesToConnect = this.multipleSelectedNodes;
        }

        for (let node of (nodesToConnect || this.structure.nodes())) {
            for (let innerNode of (nodesToConnect || this.structure.nodes())) {
                this.insertEdgeBetween(node, innerNode)
            }
        }
        // console.log(Array.from(this.structure.edges()))
        // console.log(Array.from(this.structure.uniqueEdges()))
    }

    removeAllEdges() {
        let nodesToDisconnect;
        if (this.multipleSelectedNodes.length > 0) {
            nodesToDisconnect = this.multipleSelectedNodes;
        } else {
            nodesToDisconnect = this.structure.nodes()
        }
        
        for (let node of nodesToDisconnect) {
            this.structure.removeAllEdgesFromNode(node)
        }
    }

    moveNode(node, pos) {
        this.requestHighFPS(HighFPSFeature.MOVING, 90)
        // console.log(node, pos)
        node.pos = pos;
    }

    insertEdgeBetween(nodeA, nodeB) {
        this.structure.insertEdge(nodeA, nodeB, new Edge())
    }

    removeNodeAt(pos) {
        let nodes = this.getNodeIndexAt(pos)
        if (nodes.length == 0) {
            return;
        }
        let frontmostNode = nodes[0]
        for (let node of nodes) {
            if (node._initialTime > frontmostNode._initialTime) {
                frontmostNode = node
            }
        }
        this.structure.removeNode(frontmostNode)
    }

    setSelectionRectangle(initialPos, pointerPos) {
        if(initialPos === null || pointerPos === null) {
            this.drawSelectionRectangle = () => { };
            return;
        }
        
        this.requestHighFPS(HighFPSFeature.SELECTING, 90)
        this.drawSelectionRectangle = () => {
            ctx.save()

            ctx.strokeStyle = 'blue'
            ctx.fillStyle = 'rgba(0,0,255,0.1)'
            ctx.lineWidth = 3
            let finalPosX = pointerPos.x - initialPos.x;
            let finalPosY = pointerPos.y - initialPos.y;
            ctx.fillRect  (initialPos.x, initialPos.y, finalPosX, finalPosY)
            ctx.strokeRect(initialPos.x, initialPos.y, finalPosX, finalPosY)

            ctx.restore()
        }
    }


    // Debugging function
    sourceNodeCounter = 0;
    targetNodeCounter = 0;

    getNextEdge() {
        let sourceList = Array.from(this.edges.keys())
        if (sourceList.length == 0) { return }
        
        let sourceListIndex = this.sourceNodeCounter % sourceList.length
        let sourceNodeIndex = sourceList[sourceListIndex]
        
        let targetList = Array.from(this.edges.get(sourceNodeIndex))
        let targetListIndex = this.targetNodeCounter % targetList.length
        let targetNodeIndex = targetList[targetListIndex]

        this.targetNodeCounter += 1
        
        if (this.targetNodeCounter % targetList.length == 0) {
            this.sourceNodeCounter += 1
            this.targetNodeCounter = 0
        }

        return [sourceNodeIndex, targetNodeIndex]
    }
    
    // s1 = 10
    // s2 = 10
    // selectionPrototyping(a, b) {
    //     // console.log(a, b)
    //     this.s1 = a/10
    //     this.s2 = b/10
    // }

    // Graph Drawing
    
    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    drawNode(node) {
        // Draw circle
        ctx.lineWidth = nodeBorderWidth;
        ctx.fillStyle = node.color;
        ctx.strokeStyle = nodeBorderColor;

        ctx.beginPath();
        ctx.arc(node.pos.x, node.pos.y, node.radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        // Faz o nó piscar uma cor mais clara
        if (node.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
            let t = window.performance.now()/350
            let a = Math.abs(Math.sin(t)) - 0.75
            let c = colorFromComponents(255, 255, 255, a)
            ctx.fillStyle = c
            ctx.fill()

            let c2 = colorFromComponents(0, 0, 0, 0.5)
            ctx.strokeStyle = c2
            ctx.lineWidth = 4
            // Raio do tracejado
            // (A soma faz com que o tracejado fique do lado de fora do círculo)
            let dashRadius = node.radius - ctx.lineWidth/2;
            
            ctx.setLineDash([]);
            
            // let t = window.performance.now()/2000;
            // Desenhamos a borda tracejada
            ctx.beginPath();
            ctx.arc(node.pos.x, node.pos.y, dashRadius, 0 + t, 2*Math.PI + t);
            ctx.stroke();
        }
        if (node.isSelected && this.selectionHandler.temporarySelection == false) {
            ctx.strokeStyle = "#1050FF"
            ctx.lineWidth = 4
            if (node.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
                ctx.strokeStyle = "#00A0FF"
                // ctx.lineWidth = 4
            }
            
            // Para mantermos o mesmo número de traços independente
            // do raio do círculo, fazemos os passos seguintes.

            // Raio do tracejado
            // (A soma faz com que o tracejado fique do lado de fora do círculo)
            let dashRadius = node.radius + ctx.lineWidth/2;
            // Circunferência do círculo (2π * r)
            let circ = 2*Math.PI * dashRadius;
            
            ctx.setLineDash([circ/12.5, circ/22]);
            
            let t = window.performance.now()/2000;
            // Desenhamos a borda tracejada
            ctx.beginPath();
            ctx.arc(node.pos.x, node.pos.y, dashRadius, 0 + t, 2*Math.PI + t);
            ctx.stroke();
        }
        // Draw text
        ctx.font = "bold 30px Arial";
        var grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grd.addColorStop(0, "#E5E0FF");
        grd.addColorStop(1, "#FFE0F3");

        ctx.fillStyle = grd;

        ctx.textAlign = "center";
        ctx.textBaseline = 'middle'; 
        let nodeText;
        switch (this.nodeLabeling) {
            case NodeLabeling.NUMBERS:
                nodeText = node.index;
                break;
            case NodeLabeling.LETTERS_RAND:
                nodeText = node.randomLabel;
                break;
            case NodeLabeling.LETTERS_ORD:
                nodeText = String.fromCharCode(node.index+65)
                break;
        }
        ctx.fillText(node.label || nodeText, node.pos.x, node.pos.y);
    }

    drawEdge(nodeA, nodeB) {
        if (nodeA == null || nodeB == null) {
            return;
        }
        
        ctx.beginPath()
        ctx.moveTo(nodeA.pos.x, nodeA.pos.y);
        ctx.lineTo(nodeB.pos.x, nodeB.pos.y);
        ctx.stroke();
    }

    drawEdges() {
        // ctx.lineWidth = Math.sin(window.performance.now()/1000)+15;
        ctx.lineWidth = 7
        ctx.strokeStyle = "#333";
        ctx.setLineDash([]);
        for (let [_, nodeIndexA, nodeIndexB] of this.structure.uniqueEdges()) {
            this.drawEdge(nodeIndexA, nodeIndexB);
        }
        if (this.interactionHandler.mouse.shouldDrawTemporaryEdge) {
            let a = this.getNodeIndexAt(this.interactionHandler.mouse.clickPosition)[0]
            let b = this.interactionHandler.mouse.currentMousePos
            // console.log(a, b)
            // console.log(2)
            this.drawTemporaryEdge(a, b);
        }
    }

    drawTemporaryEdge(anchorNode, pointerPos) {
        if (anchorNode == null || pointerPos == null) {
            return;
        }

        this.requestHighFPS(HighFPSFeature.CONNECTING, 90)
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath()
        ctx.moveTo(anchorNode.pos.x, anchorNode.pos.y);
        ctx.lineTo(pointerPos.x, pointerPos.y);
        ctx.stroke();
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
        
        this.drawEdges()
        
        for (let node of this.structure.nodes()) {
            this.drawNode(node)
            if (node.isSelected) {
                this.requestHighFPS(HighFPSFeature.BLINKING, 30)
            }
            if (node.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
                this.requestHighFPS(HighFPSFeature.BLINKING, 20)
            }
        }
        
        if (this.selectionHandler.drawingSelection) {
            this.selectionHandler.drawSelectionArea()
            this.requestHighFPS(HighFPSFeature.SELECTING, 90);
            // console.log(1)
        }
    }


    // Animations

    lastFrameTimestamp = window.performance.now()
    frameRateRequests = new Map()

    requestHighFPS(feature, FPS) {
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

window.onresize = function () {
  canvas.width = window.innerWidth*0.75;
  canvas.height = window.innerHeight*0.95;
  g.redrawGraph()
}