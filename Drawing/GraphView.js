import {canvas, ctx, Tool} from "./General.js"
import UndirectedGraph from "../Structure/UndirectedGraph.js"
import Node from "../Structure/Node.js"
import Edge from "../Structure/Edge.js"

const nodeRadius = 14;
const nodeBorderWidth = 2;
const nodeBorderColor = "transparent";
const nodeTextColor = "black";

const edgeWidth = 3;

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
    // nodes = [new Node(100, 200, 0), new Node(300, 100, 1)];
    // edges = new Map()
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

    insertNewNodeAt(pos) {
        let newLabel = String.fromCharCode(Math.floor(Math.random()*26)+65)
        let newNode = new Node(pos.x, pos.y, newLabel)
        this.structure.insertNode(newNode)
    }

    moveNode(node, pos) {
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
    // Graph Drawing
    
    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    drawNode(node) {
        // Draw circle
        ctx.lineWidth = nodeBorderWidth;
        ctx.fillStyle = node.color;
        ctx.strokeStyle = nodeBorderColor;

        ctx.beginPath();
        // console.log(nodeRadius, node.expansion)
        ctx.arc(node.pos.x, node.pos.y, nodeRadius*2 + node.expansion, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.font = "30px Arial Bold";
        ctx.fillStyle = nodeTextColor;

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
        ctx.lineWidth = edgeWidth;
        ctx.strokeStyle = "black";
        
        ctx.beginPath()
        ctx.moveTo(anchorNode.pos.x, anchorNode.pos.y);
        ctx.lineTo(pointerPos.x, pointerPos.y);
        ctx.stroke();
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
    
    lastRandomEdge = null;

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

    // completeGraph() {

    // }
    // This function clears the canvas and redraws it.
    redrawGraph() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // if (this.lastRandomEdge == null || window.performance.now() - this.lastRandomEdge > 5000) {
        //     this.lastRandomEdge = window.performance.now()
        //     // this.generate()
        //     // let nextEdge = this.getNextEdge()
        //     // if (nextEdge) {
        //     //     let [leftNodeIndex, rightNodeIndex] = nextEdge
        //     //     this.highlightedEdges = new Map()
        //     //     this.highlightedEdges.set(leftNodeIndex, new Set([rightNodeIndex]))
        //     // }
        // }
        this.drawEdges()
        // this.nodes.forEach(this.drawNode);
        // this.structure.nodes().forEach(this.drawNode);
        for (let node of this.structure.nodes()) {
            this.drawNode(node)
        }
    }

    // Animations
    // This function updates every node and redraws the graph.
    updateAnimations(timestamp) {
        // console.log("Update Animations");
        
        // let requestNewUpdate = false;
        for (let node of this.structure.nodes()) {
            node.update(timestamp);
            // if (node.isBlinking) { requestNewUpdate = true; }
        }
        
        this.redrawGraph();
        
        requestAnimationFrame(this.updateAnimations.bind(this));
    }
    

    
}

export let g = new GraphView(canvas);
g.redrawGraph();
g.updateAnimations();
// redrawGraph();