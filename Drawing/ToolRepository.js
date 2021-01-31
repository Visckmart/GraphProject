import {Tool} from "./General.js";

export default {
    [Tool.CONNECT_ALL]: function () {
        let nodesToConnect;
        if (this.selectionHandler.selectedNodes.length > 0) {
            nodesToConnect = this.selectionHandler.selectedNodes;
        }

        for (let node of (nodesToConnect || this.structure.nodes())) {
            for (let innerNode of (nodesToConnect || this.structure.nodes())) {
                this.insertEdgeBetween(node, innerNode)
            }
        }
    },
    [Tool.DISCONNECT_ALL]: function () {
        let nodesToDisconnect;
        if (this.selectionHandler.selectedNodes.length > 0) {
            nodesToDisconnect = this.selectionHandler.selectedNodes;
        } else {
            nodesToDisconnect = this.structure.nodes()
        }
        console.group("Desconectar " + nodesToDisconnect.length + " nós")
        for (let node of nodesToDisconnect) {
            this.structure.removeAllEdgesFromNode(node)
        }
        console.groupEnd()
    }
}