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
            if (nodeA === nodeB) {
                console.warn("Inserção de aresta que causaria um laço.", nodeA)
                return false;
            }
            if (!this.data.has(nodeA) || !this.data.has(nodeB)) {
                console.warn("Nós não encontrados no grafo")
                return false;
            }

            if (this.debug) {
                console.info("Inserindo aresta direcionada entre os nós "
                    + nodeA.label + " - " + nodeB.label, edge);
            }

            this.data.get(nodeA).set(nodeB, edge)
            return true
        }

        *edgesTo(node) {
            for(let [fromNode, nodeMap] of this.data.entries()) {
                for(let [toNode, edge] of nodeMap.entries()) {
                    if(toNode === node) {
                        yield [edge, fromNode]
                    }
                }
            }
        }
    }
}

export default GraphDirectedMixin