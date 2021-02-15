import { Tool } from "./General.js";

function getTargetElements(graphView) {
    let targetNodes;
    if (graphView.selectionHandler.hasSelectedNodes) {
        targetNodes = graphView.selectionHandler.selected.nodes;
    } else {
        targetNodes = Array.from(graphView.structure.nodes());
    }

    let targetEdges;
    if (graphView.selectionHandler.hasSelectedEdges) {
        targetEdges = graphView.selectionHandler.selected.edges;
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
        console.log(this)
        let [targetNodes,] = getTargetElements(this);

        console.group("Desconectar " + targetNodes.length + " nós");
        for (let node of targetNodes) {
            for (let [edge, , ] of this.structure.edgesFrom(node)) {
                this.structure.removeEdge(edge);
            }
        }
        console.groupEnd();
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