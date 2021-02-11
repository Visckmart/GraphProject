import {Tool} from "./General.js";

export default {
    [Tool.CONNECT_ALL]: function () {
        let nodesToConnect;
        if (this.selectionHandler.selected.nodes.length > 0) {
            nodesToConnect = this.selectionHandler.selected.nodes;
        }

        for (let node of (nodesToConnect || this.structure.nodes())) {
            for (let innerNode of (nodesToConnect || this.structure.nodes())) {
                this.insertEdgeBetween(node, innerNode)
            }
        }
    },
    [Tool.DISCONNECT_ALL]: function () {
        let nodesToDisconnect;
        if (this.selectionHandler.selected.nodes.length > 0) {
            nodesToDisconnect = this.selectionHandler.selected.nodes;
        } else {
            nodesToDisconnect = this.structure.nodes()
        }
        console.group("Desconectar " + nodesToDisconnect.length + " nós")
        for (let node of nodesToDisconnect) {
            this.structure.removeAllEdgesFromNode(node)
        }
        console.groupEnd()
    },

    [Tool.DELETE_ALL]: function () {
        for (let node of this.selectionHandler.selected.nodes) {
            this.structure.removeNode(node)
        }
        for (let edge of this.selectionHandler.selected.edges) {
            this.structure.removeEdge(edge)
        }
        this.selectionHandler.clear()
    }
}