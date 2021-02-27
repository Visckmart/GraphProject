let GraphDirectedMixin = (superclass) => {
    return class DirectedGraph extends  superclass {
        constructor(args) {
            super(args);

            this.mixins.add(GraphDirectedMixin)
        }

        // Inserção
        insertEdge(nodeA, nodeB, edge) {
            if (!(nodeA && nodeB && edge)) {
                console.error("Inserção de aresta chamada incorretamente.")
                return;
            }

            if (this.debug) {
                console.info("Inserindo aresta direcionada entre os nós "
                    + nodeA.label + " - " + nodeB.label, edge);
            }

            this.data.get(nodeA).set(nodeB, edge)
        }
    }
}

export default GraphDirectedMixin