class Graph {
    data = new Map();

    constructor() {
        if (this.constructor == Graph) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    insertNode(node) {
        // Validação
        if (!(node)) {
            console.error("Inserção de nó chamada incorretamente.");
            return;
        }
        debugPrint("Inserindo nó", node)
        console.assert(this.data.has(node) == false, "Nó já estava no grafo.")
        
        // Operação
        this.data.set(node, new Map());
    }

    removeNode(node) {
        // Validação
        if (!(node)) {
            console.error("Remoção de nó chamada incorretamente.");
            return;
        }
        debugPrint("Removendo nó", node)
        console.assert(this.data.has(node) == true, "Nó não está no grafo.")
        
        // Operação
        for (let [_, nodeA, nodeB] of this.edges()) {
            if (nodeB == node) {
                this.removeEdgeBetween(nodeA, nodeB)
            }
        }
        this.data.delete(node)
    }

    insertEdge(nodeA, nodeB, edge) {
        console.trace()
        throw new Error("Não implementado!")
    }

    removeEdgeBetween(nodeA, nodeB) {
        console.trace()
        throw new Error("Não implementado!")
    }

    removeAllEdgesFromNode(node) {
        for (let [edge, nodeA, nodeB] of this.edges()) {
            if (nodeA == node || nodeB == node) {
                this.removeEdge(edge)
            }
        }
    }
    
    removeEdge(edge) {
        // Validação
        if (!(edge)) {
            console.error("Remoção de uma aresta específica chamada incorretamente.")
            return;
        }
        debugPrint("Removendo aresta " + edge.label)

        // Operação
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
        // Validação
        let connA = this.data.get(nodeA)
        if (connA == null) {
            console.warn("Houve uma tentativa de obter uma aresta inexistente.")
            return null;
        }

        // Operação
        return connA.get(nodeB)
    }
    
    checkEdgeBetween(nodeA, nodeB) {
        let connA = this.data.get(nodeA);
        if (connA == null) {
            console.warn("Houve uma tentativa de checar uma aresta  inexistente.")
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
            // this.data.delete(Array.from(this.data.keys())[2]);
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

    *uniqueEdges() {
        let previousEdges = new Set()
        for (let [nodeA, connections] of this.data) {
            for (let [nodeB, edge] of connections) {
                if (previousEdges.has(edge)) continue;
                previousEdges.add(edge)
                yield [edge, nodeA, nodeB];
            }
        }
    }

    *edgesFrom(node) {
        for(let [nodeB, edge] of this.data.get(node))
        {
            yield [edge, nodeB]
        }
    }

    serialize() {
        let serializedNodes = []
        for(let node of this.nodes())
        {
            serializedNodes.push(node.serialize())
        }

        let serializedEdged = []
        let pairs = []
        for(let [edge, nodeA, nodeB] of this.uniqueEdges())
        {
            serializedEdged.push(edge.serialize())
            pairs.push([nodeA.index,nodeB.index])
        }

        return JSON.stringify({
            d: {
                n: serializedNodes,
                e: serializedEdged
            },
            p:pairs
        })
    }

    static deserialize(string) {
        console.warn("Can't deserialize abstract class")
        return null
    }
}

export default Graph