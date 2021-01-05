import {canvas, ctx, Tool, HighFPSFeature} from "./General.js"
import UndirectedGraph from "../Structure/UndirectedGraph.js"
import Node from "../Structure/Node.js"
import Edge from "../Structure/Edge.js"
import { nodeRadius } from "../Structure/Node.js"


const nodeBorderWidth = 2;
const nodeBorderColor = "transparent";
const nodeTextColor = "black";

const edgeWidth = 3;

const IDLE_MAX_FPS = 10;
const INTERACTION_MAX_FPS = 90;


// Graph
class GraphView {

    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.insertNewNodeAt({x: 100, y: 150})
        this.insertNewNodeAt({x: 200, y: 50})
    }

    primaryTool = Tool.MOVE;
    structure = new UndirectedGraph();
    highlightedEdges = new Map()


    // Node Handling

    // Searches for nodes that contain the point `pos`
    // The lookup is done from the last node to the first, the inverse of the
    // drawing lookup in order to return the frontmost node.
    getNodeIndexAt(pos, checkForConflict = false) {
        let radiusCheck;
        if (checkForConflict) { radiusCheck = nodeRadius * 2; }
        else                  { radiusCheck = nodeRadius; }
        
        let detectedNodes = [];
        for (let node of this.structure.nodes()) {
            let dx = node.pos.x - pos.x;
            let dy = node.pos.y - pos.y;
            if (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) < radiusCheck*2) {
                detectedNodes.push(node);
            }
        }
        return detectedNodes;
    }

    getNodesWithin(initialPos, finalPos) {
        let x = Math.min(initialPos.x, finalPos.x) - nodeRadius
        let y = Math.min(initialPos.y, finalPos.y) - nodeRadius
        let w = Math.max(initialPos.x, finalPos.x) - x + nodeRadius
        let h = Math.max(initialPos.y, finalPos.y) - y + nodeRadius

        let nodesWithin = []
        for(let node of this.structure.nodes())
        {
            if(node.pos.x > x && node.pos.y > y && node.pos.x < x + w && node.pos.y < y + h)
            {
                nodesWithin.push(node)
            }
        }
        return nodesWithin
    }

    insertNewNodeAt(pos) {
        let newLabel = String.fromCharCode(Math.floor(Math.random()*26)+65)
        let newNode = new Node(pos.x, pos.y, newLabel)
        this.structure.insertNode(newNode)
        this.redrawGraph();
    }

    moveNode(node, pos) {
        node.pos = pos;
        this.requestHighFPS(HighFPSFeature.MOVING, 90)
        // console.log("move")
        // this.redrawGraph();
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
        
        // Draw text
        ctx.font = "30px Arial Bold";
        var grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grd.addColorStop(0, "#E5E0FF");
        grd.addColorStop(1, "#FFE0F3");

        ctx.fillStyle = grd;

        ctx.textAlign = "center";
        ctx.textBaseline = 'middle'; 
        ctx.fillText(node.label, node.pos.x, node.pos.y);
    }

    drawEdge(nodeA, nodeB) {
        if (nodeA == null || nodeB == null)
            return;
        // let connA = this.highlightedEdges.get(nodeIndexA);
        // // console.log(connA)
        // if (connA && connA.has(nodeIndexB)) {
        //     ctx.strokeStyle = "blue";
        // } else {
        //     ctx.strokeStyle = "gray";
        // }
        ctx.beginPath()
        ctx.moveTo(nodeA.pos.x, nodeA.pos.y);
        // let mpx = (nodeA.pos.x + nodeB.pos.x)/2
        // let mpy = (nodeA.pos.y + nodeB.pos.y)/2
        // ctx.bezierCurveTo(nodeA.pos.x, nodeA.pos.y - 100, nodeB.pos.x, nodeA.pos.y - 100, nodeB.pos.x, nodeB.pos.y);
        // DUAS ARESTAS NOS MESMOS NÓS
        /*
        let mpx = (nodeA.pos.x + nodeB.pos.x)/2
        let mpy = (nodeA.pos.y + nodeB.pos.y)/2

        // angle of perpendicular to line:
        var theta = Math.atan2(nodeB.pos.y - nodeA.pos.y, nodeB.pos.x - nodeA.pos.x) - Math.PI / 2;

        // distance of control point from mid-point of line:
        var offset = 50;
        // if (nodeIndexA < nodeIndexB) {
        //     offset = -offset;
        // }

        // location of control point:
        var c1x = mpx + offset * Math.cos(theta);
        var c1y = mpy + offset * Math.sin(theta);
        ctx.quadraticCurveTo(c1x, c1y, nodeB.pos.x, nodeB.pos.y);
        */
        // let a = mpx
        // let b = mpy
        ctx.lineTo(nodeB.pos.x, nodeB.pos.y);
        ctx.stroke();
        // ctx.textAlign = "center";
        // ctx.textBaseline = 'middle';
        // // ctx.translate(-50, -50)
        // ctx.save()
        // ctx.translate(a, b)
        // // let h = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
        // let theta = Math.atan2(-mpy, -mpx); // range (-PI, PI]
        //   // theta *= 180 / Math.PI; 
        // ctx.rotate(theta)
        // ctx.translate(0, -15)
        // ctx.translate(-a, -b)
        
        // // ctx.rotate(Math.sin((window.performance.now() - nodeA._initialTime)/100)) 
        // // ctx.rotate(1)
        // // ctx.translate(-nodeA.pos.x, -nodeA.pos.y)
        // // console.log(nodeA._initialTime)
        // // ctx.translate(canvas.width/2, canvas.height/2)
        // ctx.fillText("AB", a, b);
        // // ctx.translate(-canvas.width/2 + nodeA.pos.x+50, -canvas.height/2 + nodeA.pos.y + 50)
        // // ctx.translate(0, 0);
        // ctx.restore()
        // ctx.translate(50, 50)
    }

    drawEdges() {
        // ctx.lineWidth = Math.sin(window.performance.now()/1000)+15;
        ctx.lineWidth = 8
        ctx.strokeStyle = "black";
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
            // console.log(1)
            return;
        }
        // console.log(2)
        // this.inter = 1000/60;
        this.requestHighFPS(HighFPSFeature.CONNECTING, 90)
        ctx.lineWidth = edgeWidth;
        ctx.strokeStyle = "black";
        
        ctx.beginPath()
        ctx.moveTo(anchorNode.pos.x, anchorNode.pos.y);
        ctx.lineTo(pointerPos.x, pointerPos.y);
        ctx.stroke();
    }

    setSelectionRectangle(initialPos, pointerPos) {
        if(initialPos === null || pointerPos === null)
        {
            this.drawSelectionRectangle = () => { }
            return
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

    checkEdge(nodeIndexA, nodeIndexB) {
        let smallIndex = Math.min(nodeIndexA, nodeIndexB)
        let bigIndex   = Math.max(nodeIndexA, nodeIndexB)
        let outgoingEdges = this.edges.get(smallIndex)
        if (outgoingEdges && outgoingEdges.has(bigIndex)) {
            return true;
        } else {
            return false;
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
        
        this.drawEdges()
        for (let node of this.structure.nodes()) {
            this.drawNode(node)
            if (node._isBlinking) {
                this.requestHighFPS(HighFPSFeature.BLINKING, 60)
            }
        }
        if (this.drawSelectionRectangle) {
            this.drawSelectionRectangle()
        }
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
        let highestFPS = Math.max(Array.from(this.frameRateRequests.values()))
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
  canvas.height = window.innerHeight*0.75;
  g.redrawGraph()
}
// redrawGraph();