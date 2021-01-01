class UndirectedGraph extends Graph {

    // Inserção
    insertEdge(nodeA, nodeB, edge) {
        if (!(nodeA && nodeB && edge)) {
            console.error("Inserção de aresta chamada incorretamente.")
            return;
        }
        debugPrint("Inserindo aresta " + edge.label + " do nó " + nodeA.label +
                   " até o nó " + nodeB.label, edge);
        this.data.get(nodeA).set(nodeB, edge)
        this.data.get(nodeB).set(nodeA, edge)
    }

    // Remoção
    removeEdgeBetween(nodeA, nodeB) {
        if (!(nodeA && nodeB)) {
            console.error("Remoção de aresta chamada incorretamente.")
            return;
        }
        debugPrint("Removendo aresta que conecta os nós " + nodeA.label +
                   " – " + nodeB.label)
        this.data.get(nodeA).delete(nodeB)
        this.data.get(nodeB).delete(nodeA)
    }
}