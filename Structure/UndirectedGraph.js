import Graph from "./Graph.js";
import {UndirectedEdge} from "./UndirectedEdge.js";
import {UndirectedTemporaryEdge} from "./UndirectedTemporaryEdge.js";
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
}

export default UndirectedGraph