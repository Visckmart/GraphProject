import Graph from "./Graph.js";
class UndirectedGraph extends Graph {

    // Inserção
    insertEdge(nodeA, nodeB, edge) {
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