import {Tool} from "./General.js";

function getTargetElements(graphView) {
    let targetNodes;
    let selectedNodes = graphView.selectionHandler.selected.nodes;
    if (selectedNodes.length > 0) {
        targetNodes = selectedNodes;
    } else {
        targetNodes = Array.from(graphView.structure.nodes());
    }

    let targetEdges;
    let selectedEdges = graphView.selectionHandler.selected.edges;
    if (selectedEdges.length > 0) {
        targetEdges = selectedEdges;
    } else {
        targetEdges = Array.from(graphView.structure.uniqueEdges())
                            .map(edgeInfo => edgeInfo[0]);
    }
    return [targetNodes, targetEdges];
}

export default {
    [Tool.CONNECT_ALL]: function () {
        let [targetNodes,] = getTargetElements(this);

        for (let node of targetNodes) {
            for (let innerNode of targetNodes) {
                this.insertEdgeBetween(node, innerNode)
            }
        }
    },
    [Tool.DISCONNECT_ALL]: function () {
        let [targetNodes,] = getTargetElements(this);

        console.group("Desconectar " + targetNodes.length + " nós")
        for (let node of targetNodes) {
            this.structure.removeAllEdgesFromNode(node)
        }
        console.groupEnd()
    },

    [Tool.DELETE_ALL]: function () {
        let [targetNodes, targetEdges] = getTargetElements(this);
        for (let edge of targetEdges) {
            this.structure.removeEdge(edge);
        }
        for (let node of targetNodes) {
            this.structure.removeNode(node);
        }
        this.selectionHandler.clear();
    }
}