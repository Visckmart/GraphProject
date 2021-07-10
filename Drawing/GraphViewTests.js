import {HighlightType} from "../Utilities/Highlights.js";
import Node from "../Structure/Node.js";
import Edge from "../Structure/Edge.js";
import {generateRandomNodes} from "./GraphViewDebugHelper.js";
import {Tool} from "./General.js";
const s = 1000;

let t = 0;
function convertMousePos(x, y, graphView) {
    let canvasRect = graphView.canvas.getBoundingClientRect();
    return {
        x: x + canvasRect.left,
        y: y + canvasRect.top
    };
}

function simulateMouseDown(x, y, graphView) {
    let clientPos = convertMousePos(x, y, graphView)
    graphView.mouseHandler.mouseDownEvent(
        // {clientX: clientPos.x, clientY: clientPos.y}
        {clientX: x, clientY: y}
    )
}
function simulateClick(x, y, graphView, button = 0) {
    // let clientPos = convertMousePos(x, y, graphView)
    graphView.mouseHandler.mouseDownEvent(
        {clientX: x, clientY: y, button: button, buttons: 1}
    )
    graphView.mouseHandler.mouseUpEvent(
        {clientX: x, clientY: y, button: button, buttons: 1}
    )
}
function simulateHover(x, y, graphView) {
    graphView.mouseHandler.mouseMoveEvent(
        {clientX: x, clientY: y})
}
function simulateClickAndDrag(clientX, clientY, endX, endY, graphView, time = 1) {
    // let clientPos = convertMousePos(clientX, clientY, graphView)
    // clientX = clientPos.x
    // clientY = clientPos.y
    // let endPos = convertMousePos(endX, endY, graphView)
    // endX = endPos.x
    // endY = endPos.y
    simulateMouseDown(clientX, clientY, graphView)
    let steps = time*1000/25
    let distX = endX-clientX
    let distY = endY-clientY
    for (let i = 1; i < steps; i++) {
        setTimeout(() => {
            let dragEvent = {
                clientX: clientX + distX / steps * i,
                clientY: clientY + distY / steps * i,
                button: 0
            }
            graphView.mouseHandler.mouseMoveEvent(dragEvent)
        }, 22.5*i);
    }
    setTimeout(() => {
        let upEvent = {clientX: endX, clientY: endY}
        graphView.mouseHandler.mouseUpEvent(upEvent)
    }, time*1000);
}
function runAfter(delay, func) {
    t += delay
    setTimeout(func, t*1000)
}
export function testBasicRoutine(graphView) {
    runAfter(0.5, () => {
        simulateClick(200, 100, graphView)
    })

    runAfter(0.25, () => {
        simulateClick(300, 100, graphView)
    })
    runAfter(0.25, () => {
        simulateClick(500, 100, graphView)
    });

    runAfter(0.5, () => {
        graphView.primaryTool = Tool.CONNECT
    });
    runAfter(0.25, () => {
        simulateClickAndDrag(300, 100,
                             300, 250,
                             graphView, 0.5)
    });
    runAfter(0.7, () => {
        simulateHover(300, 150, graphView)
    });
    runAfter(0.5, () => {
        simulateClick(300, 150, graphView)
    });
    runAfter(1, () => {
        simulateHover(0, 0, graphView)
        simulateClick(0, 0, graphView)
    });

    runAfter(0.25, () => {
        graphView.primaryTool = Tool.MOVE
    });
    runAfter(1, () => {
        simulateClickAndDrag(150, 50,
                             350, 300,
                             graphView, 0.5)
    });
    runAfter(1, () => {
        simulateClickAndDrag(200, 100,
                             340, 160,
                             graphView)
    });
    runAfter(1, () => {
        simulateClickAndDrag(500, 100,
                             515, 85,
                             graphView, 0.5)
    });
    runAfter(1, () => {
        simulateClick(340, 160, graphView, 2)
    });
}

// export function testSelection(graphView) {
//     generateRandomNodes(graphView, 4)
//     setTimeout(() => {
//         simulateClickAndDrag(100, 100,
//                              500, 300, graphView)
//     }, 1*s)
//
//     setTimeout(() => {
//         let pos = graphView.selectionHandler.selected.nodes[0].pos
//         simulateClickAndDrag(pos.x, pos.y,
//                              pos.x+80, pos.y+30, graphView, 0.5)
//     }, 2.5*s)
//
//     setTimeout(() => {
//         simulateClick(0, 0, graphView)
//     }, 3.5*s)
//
//     setTimeout(() => {
//         simulateClick(100, 100, graphView)
//     }, 3.5*s)
// }

export function testHighlights(graphView) {
    let properties = [
        {label: "A"},
        {label: "B", highlights: new Set([HighlightType.SELECTION])},
        {label: "C", highlights: new Set([HighlightType.LIGHTEN])},
        {label: "D", highlights: new Set([HighlightType.DARKEN])},
        {label: "E", highlights: new Set([HighlightType.DARK_WITH_BLINK])},
        {label: "F", highlights: new Set([HighlightType.COLORED_A])},
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
        {label: "F", highlights: new Set([HighlightType.COLORED_A])},
        {label: "G", highlights: new Set([HighlightType.DISABLED])},
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