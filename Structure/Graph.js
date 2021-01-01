class Graph {
    data = new Map();

    constructor() {
        if (this.constructor == Graph) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    insertNode(node) {
        if (!(node)) {
            console.error("Inserção de nó chamada incorretamente.");
            return;
        }
        debugPrint("Inserindo nó", node)
        console.assert(this.data.has(node) == false, "Nó já estava no grafo.")
        this.data.set(node, new Map());
    }

    insertEdge(nodeA, nodeB, edge) {
        console.trace()
        throw new Error("Não implementado!")
    }

    removeEdgeBetween(nodeA, nodeB) {
        console.trace()
        throw new Error("Não implementado!")
    }
    
    removeEdge(edge) {
        if (!(edge)) {
            console.error("Remoção de uma aresta específica chamada incorretamente.")
            return;
        }
        debugPrint("Removendo aresta " + edge.label)
        let anyEdgeRemoved = false;
        for (let [currentEdge, nodeA, nodeB] of this.edges()) {
            if (currentEdge == edge) {
                this.data.get(nodeA).delete(nodeB)
                anyEdgeRemoved = true;
            }
        }
        if (!anyEdgeRemoved) {
            console.warn("A aresta a ser removida não foi encontrada.")
        }
    }

    getEdgeBetween(nodeA, nodeB) {
        let connA = this.data.get(nodeA)
        if (connA == null) {
            console.warn("Houve uma tentativa de obter uma aresta inexistente.")
            return null;
        }
        return connA.get(nodeB)
    }
    
    checkEdgeBetween(nodeA, nodeB) {
        let connA = this.data.get(nodeA);
        if (connA == null) {
            return false;
        }
        return connA.get(nodeB) != null;
    }

    showGraph(pure = false) {
        if (pure == true) {
            console.log(this.data);
            return;
        }
        
        let graphString = ""
        for (let [nodeA, connections] of this.data) {
            let connectionsString = Array.from(connections.keys()).map(nodeB => nodeB.label)
            if (connectionsString.length == 0) {
                graphString += nodeA.label + "\t–>|\n"
            } else {
                graphString += nodeA.label + "\t–> " + connectionsString + "\n"
            }
        }
        console.log(graphString)
    }

    *nodes() {
        // yield* this.data.keys()
        for (let n of this.data.keys()) {
            this.data.delete(Array.from(this.data.keys())[2]);
            yield n;
        }
    }

    *edges() {
        for (let [nodeA, connections] of this.data) {
            for (let [nodeB, edge] of connections) {
                yield [edge, nodeA, nodeB];
            }
        }
    }
}

export default Graph