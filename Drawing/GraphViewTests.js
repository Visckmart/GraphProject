import {HighlightType} from "../Structure/Highlights.js";
import Node from "../Structure/Node.js";
import Edge from "../Structure/Edge.js";
import {generateRandomNodes} from "./GraphViewDebugHelper.js";


function simulateClick(clientX, clientY, graphView) {
    graphView.interactionHandler.mouse.mouseDownEvent({clientX: clientX, clientY: clientY})
}
function simulateClickAndDrag(clientX, clientY, endX, endY, graphView, time = 1) {
    simulateClick(clientX, clientY, graphView)
    let steps = time*1000/25
    let distX = endX-clientX
    let distY = endY-clientY
    for (let i = 1; i < steps; i++) {
        setTimeout(() => {
            let event = {
                clientX: clientX + distX / steps * i,
                clientY: clientY + distY / steps * i,
                button: 0
            }
            graphView.interactionHandler.mouse.mouseDragEvent(event)
        }, 22.5*i);
    }
    setTimeout(() => {
        graphView.interactionHandler.mouse.mouseUpEvent({clientX: endX, clientY: endY})
        console.log("end selection")
    }, time*1000);
}
export function testSelection(graphView) {
    generateRandomNodes(graphView, 4)
    setTimeout(() => {
        simulateClickAndDrag(100, 100,
                             500, 300, graphView)
        setTimeout(() => {
            console.log("move")
            let pos = graphView.selectionHandler.selected.nodes[0].pos
            simulateClickAndDrag(pos.x, pos.y,
                                 pos.x+40, pos.y+10, graphView, 0.5)
        }, 2000)
    }, 1000)
}

export function testHighlights(graphView) {
    let properties = [
        {label: "A"},
        {label: "B", highlights: new Set([HighlightType.SELECTION])},
        {label: "C", highlights: new Set([HighlightType.LIGHTEN])},
        {label: "D", highlights: new Set([HighlightType.DARKEN])},
        {label: "E", highlights: new Set([HighlightType.DARK_WITH_BLINK])},
        {label: "F", highlights: new Set([HighlightType.COLORED_BORDER])},
        {label: "G"},
        {label: "H"},
        {label: "I"},
        {label: "J"}
    ]

    let nodeCount = 0;
    let addedNodes = []
    for (let property of properties) {
        let nc = nodeCount
        let p = {
            x: graphView.canvas.width/(properties.length+1)*(++nodeCount), y: 40, colorIndex: 4}
        p = Object.assign(p, property)
        let node = new Node(p)
        graphView.structure.insertNode(node)
        addedNodes.push(node)

        nodeCount = nc
        p = {
            x: graphView.canvas.width/(properties.length+1)*(++nodeCount), y: 80}
        p = Object.assign(p, property)
        node = new Node(p)
        graphView.structure.insertNode(node)
        addedNodes.push(node)
    }
    let edges = [
        {label: "A"},
        {label: "B", highlights: new Set([HighlightType.SELECTION])},
        {label: "C", highlights: new Set([HighlightType.LIGHTEN])},
        {label: "D", highlights: new Set([HighlightType.DARKEN])},
        {label: "E", highlights: new Set([HighlightType.DARK_WITH_BLINK])},
        {label: "F", highlights: new Set([HighlightType.COLORED_BORDER])},
        {label: "G", highlights: new Set([HighlightType.ALGORITHM_NOTVISITED])},
        {label: "H", highlights: new Set([HighlightType.ALGORITHM_VISITING])},
        {label: "I", highlights: new Set([HighlightType.FEATURE_PREVIEW])},
        {label: "J"}
    ]

    let addedEdges = 0
    for (let property of edges) {
        let edge = new Edge(property)
        graphView.structure.insertEdge(addedNodes[addedEdges++],
                                       addedNodes[addedEdges++], edge)
    }
}