import {canvas, ctx, Tool, HighFPSFeature} from "./General.js"
import UndirectedGraph from "../Structure/UndirectedGraph.js"
import Node from "../Structure/Node.js"
import Edge from "../Structure/Edge.js"
import GraphInteraction from "./GraphInteraction.js"


const nodeBorderWidth = 2;
const nodeBorderColor = "transparent";
const nodeTextColor = "black";

const edgeWidth = 3;

const IDLE_MAX_FPS = 10;
const INTERACTION_MAX_FPS = 90;



const NodeLabeling = {
    NUMBERS: "numbers",
    LETTERS_RAND: "letters_randomized",
    LETTERS_ORD: "letters_ordered"
}
// Graph
class GraphView {

    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.insertNewNodeAt({x: 100, y: 150})
        this.insertNewNodeAt({x: 200, y: 50})

        // console.log(this.mouseDownEvent)
        // console.log(this.prototype)
        Object.assign(this, GraphInteraction(this))
        // Object.assign(this, GraphInteraction.nodeDragHandler(this))
        // console.log(this.a)
    }

    primaryTool = Tool.MOVE;
    structure = new UndirectedGraph();
    highlightedEdges = new Map();
    nodeLabeling = NodeLabeling.LETTERS_RAND;


    // Interaction

    getMousePos(mouseEvent) {
        var canvasRect = this.canvas.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - canvasRect.left,
            y: mouseEvent.clientY - canvasRect.top
        };
    }

    refreshCursorStyle() {
        // Restaura o ponteiro para o visual padrão
        let cursorStyle = null;
        // Se não sabemos a posição (acontece antes do primeiro movimento)
        if (this.currentMousePos == null) {
            return;
        }
        let isHoveringNode = this.getNodeIndexAt(this.currentMousePos).length > 0;
        // Checa se a ferramenta MOVE está selecionada
        let moveToolSelected = this.primaryTool == Tool.MOVE;
        
        // Se a ferramenta MOVE for selecionada E o mouse estiver sobre um nó
        if (moveToolSelected && isHoveringNode) {
            if (this.selectedNode == null) {
                cursorStyle = "grab"
            } else {
                cursorStyle = "grabbing"
            }
        }
        if (g.multipleSelection == true) {
            cursorStyle = "crosshair"
        }
        // Atualize o estilo apropriadamente
        this.canvas.style.cursor = cursorStyle;
    }

    /* Destaca os nós selecionados */
    updateMultipleSelectedNodes()
    {
        for(let node of g.structure.nodes())
        {
            if(this.multipleSelectedNodes.includes(node))
            {
                node.blink()
            } else {
                node.stopBlink()
            }
        }
        // g.requestHighFPS(HighFPSFeature.BLINK, 30)
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
        if (this.getNodeIndexAt(pos, true).length != 0) {
            return;
        }
        // let newLabel = String.fromCharCode(Math.floor(Math.random()*26)+65)
        let newNode = new Node(pos.x, pos.y)
        this.structure.insertNode(newNode)
        this.redrawGraph();
    }

    connectAllEdges() {
        for(let node of this.structure.nodes())
        {
            for(let innerNode of this.structure.nodes())
            {
                this.insertEdgeBetween(node, innerNode)
            }
        }
    }

    moveNode(node, pos) {
        this.requestHighFPS(HighFPSFeature.MOVING, 90)
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
    
    s1 = 10
    s2 = 10
    selectionPrototyping(a, b) {
        // console.log(a, b)
        this.s1 = a/10
        this.s2 = b/10
    }
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
        
        if (node._isBlinking) {
            ctx.strokeStyle = "#1050FF"
            ctx.lineWidth = 4
            let t = window.performance.now()/1000
            let t2 = t/2
            let r = node.radius + 2
            // let r = Math.sin(t)*10+20
            let c = 2*Math.PI*r
            // console.log(c, this.s1, this.s2)
            // ctx.setLineDash([c/this.s1, c/this.s2]);
            ctx.setLineDash([c/12.5, c/22]);
            ctx.beginPath()
            // console.log(h)
            // ctx.moveTo(100, 100);
            // ctx.lineTo(x, 200);
            ctx.arc(node.pos.x, node.pos.y, r, 0+t2, 2*Math.PI+t2);
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
        let drawn = new Set()
        for (let [e, nodeIndexA, nodeIndexB] of this.structure.edges()) {
            if (drawn.has(e)) continue;
            drawn.add(e)
            this.drawEdge(nodeIndexA, nodeIndexB);
        }
        this.drawTemporaryEdge(this.selectedNode, this.pointerPos);
    }

    drawTemporaryEdge(anchorNode, pointerPos) {
        if (anchorNode == null || pointerPos == null) {
            return;
        }

        this.requestHighFPS(HighFPSFeature.CONNECTING, 90)
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        // let h = Math.sqrt(Math.pow(Math.abs(pointerPos.x-anchorNode.pos.x), 2) + Math.pow(Math.abs(pointerPos.y - anchorNode.pos.y), 2))
        // console.log(h)
        // let s = Math.floor(h/100)*5
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
            if (node._isBlinking) {
                this.requestHighFPS(HighFPSFeature.BLINKING, 30)
            }
        }
        if (this.drawSelectionRectangle) {
            this.drawSelectionRectangle()
        }

        // ctx.strokeStyle = "black"
        // ctx.lineWidth = 3
        // let t = window.performance.now()/1000
        // // console.log(t)
        // let x = Math.sin(t)*50+200
        // let y = 200
        // let h = Math.sqrt(Math.pow(x-100, 2) + Math.pow(y - 100, 2))
        // let r = Math.sin(t)*10+20
        // let c = 2*Math.PI*r
        // ctx.setLineDash([c/30, c/15]);
        // ctx.beginPath()
        // // console.log(h)
        // // ctx.moveTo(100, 100);
        // // ctx.lineTo(x, 200);
        // ctx.arc(100, 100, r, t, 2*Math.PI+t);
        // ctx.stroke();
    }


    // Animations

    lastFrameTimestamp = window.performance.now()
    frameRateRequests = new Map()

    requestHighFPS(feature, FPS) {
        this.frameRateRequests.set(feature, FPS)
    }
    
    getCurrentFPS() {
        // if (this.frameRateRequests.size != 0) {
        //     console.log(this.frameRateRequests)
        // }
        let highestFPS = Math.max(...Array.from(this.frameRateRequests.values()))

        // if (highestFPS == NaN) {
            // console.log(Array.from(this.frameRateRequests.values()) + " " + highestFPS)
        // }
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
        this.frameRateRequests = new Map();
        
        this.redrawGraph();
        this.drawCurrentMaxFPS(currentFPS)
        
    }
    
}

export let g = new GraphView(canvas);
g.redrawGraph();
g.updateAnimations();

window.onresize = function () {
  // canvas.style.borderImageSource = "linear-gradient(to right, #743ad5, red)";
  canvas.width = window.innerWidth*0.75;
  canvas.height = window.innerHeight*0.95;
  g.redrawGraph()
}
// redrawGraph();