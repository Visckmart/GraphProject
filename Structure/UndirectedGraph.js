import Graph from "./Graph.js";
import {UndirectedEdge} from "./UndirectedEdge.js";
import {UndirectedTemporaryEdge} from "./UndirectedTemporaryEdge.js";
import {Node} from "./Node.js";
import {resetColorRotation} from "../Drawing/General.js";
class UndirectedGraph extends Graph {

    // Inserção
    insertEdgeBetween(nodeA, nodeB) {
        let edge = new UndirectedEdge(String.fromCharCode(Math.floor(Math.random()*26)+65))
        // Verificação
        if (!(nodeA && nodeB && edge)) {
            console.error("Inserção de aresta chamada incorretamente.")
            return;
        }
        if (nodeA == nodeB) {
            return;
        }
        debugPrint("Inserindo aresta " + edge.label + " do nó " + nodeA.label +
                   " até o nó " + nodeB.label, edge);
        
        // Operação
        this.data.get(nodeA).set(nodeB, edge)
        this.data.get(nodeB).set(nodeA, edge)
    }

    // Inserindo edge específico
    insertEdge(nodeA, nodeB, edge) {
        // Verificação
        if (!(nodeA && nodeB)) {
            console.error("Inserção de aresta chamada incorretamente.")
            return;
        }
        if (nodeA === nodeB) {
            return;
        }
        debugPrint("Inserindo aresta " + edge.label + " do nó " + nodeA.label +
            " até o nó " + nodeB.label, edge);

        // Operação
        this.data.get(nodeA).set(nodeB, edge)
        this.data.get(nodeB).set(nodeA, edge)
    }

    // Criando aresta temporária
    createTemporaryEdge() {
        return new UndirectedTemporaryEdge("")
    }

    // Remoção
    removeEdgeBetween(nodeA, nodeB) {
        // Verificação
        if (!(nodeA && nodeB)) {
            console.error("Remoção de aresta chamada incorretamente.")
            return;
        }
        debugPrint("Removendo aresta que conecta os nós " + nodeA.label +
                   " – " + nodeB.label)
        
        // Operação
        this.data.get(nodeA).delete(nodeB)
        this.data.get(nodeB).delete(nodeA)
    }

    static deserialize(string) {
        resetColorRotation()
        let graph = new UndirectedGraph()
        let [allNodesStr, allEdgesStr] = string.split("~")
        let deserializedNodes = []
        if (allNodesStr) {
            let serializedNodes = allNodesStr.split(".")
            serializedNodes.splice(-1, 1)
            for (let nodeStr of serializedNodes) {
                let node = Node.deserialize(nodeStr)
                if (node == undefined) continue;
                deserializedNodes.push(node)
                graph.insertNode(node)
            }
        }
        if (allEdgesStr) {
            let serializedEdges = allEdgesStr.split(".")
            serializedEdges.splice(-1, 1)
            for (let edgeStr of serializedEdges) {
                const re = /(\d+)_(\d+)-(.*)/i;
                let found = edgeStr.match(re);
                if (found == undefined) continue;
                const [_, nodeA, nodeB, edgeData] = found;

                let ne = UndirectedEdge.deserialize(edgeData)
                graph.insertEdge(
                    deserializedNodes.find(n => n.index === parseInt(nodeA)),
                    deserializedNodes.find(n => n.index === parseInt(nodeB)),
                    ne
                )
            }
        }
        
        return graph
    }
}

export default UndirectedGraph