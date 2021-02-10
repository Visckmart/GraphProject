import Edge from "./Edge.js";
import EdgeTemporaryMixin from "./Mixins/Edge/EdgeTemporaryMixin.js";
import {Node} from "./Node.js";
import {resetColorRotation} from "../Drawing/General.js";

class Graph {
    constructor({ data = new Map(), EdgeConstructor = Edge, NodeConstructor = Node } = {}) {
        this.data = data
        this.debug = false

        // Guardando construtores de elementos do grafo
        this.EdgeConstructor = EdgeConstructor
        this.NodeConstructor = NodeConstructor
    }

    get _args() {
        return {
            data: this._cloneData(),
            EdgeConstructor: this.EdgeConstructor,
            NodeConstructor: this.NodeConstructor
        }
    }


    // Inserção
    insertEdgeBetween(nodeA, nodeB) {
        let edge = new this.EdgeConstructor({ label: String.fromCharCode(Math.floor(Math.random()*26)+65) })
        // Verificação
        if (!(nodeA && nodeB && edge)) {
            console.error("Inserção de aresta chamada incorretamente.", nodeA, nodeB, edge)
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

    // Inserindo edge específico
    insertEdge(nodeA, nodeB, edge) {
        // Verificação
        if (!(nodeA && nodeB)) {
            console.error("Inserção de aresta chamada incorretamente.", nodeA, nodeB, edge)
            return;
        }
        if (nodeA === nodeB) {
            return;
        }
        if (this.debug) {
            // console.log(edge)
            debugPrint("Inserindo aresta " + edge.label + " do nó " + nodeA.label +
                " até o nó " + nodeB.label, edge);
        }

        // Operação
        this.data.get(nodeA).set(nodeB, edge)
        this.data.get(nodeB).set(nodeA, edge)
    }

    // Criando aresta temporária
    // createTemporaryEdge() {
    //     let TemporaryEdge = EdgeTemporaryMixin(Edge);
    //     return new TemporaryEdge({label: ''})
    // }
    temporaryEdge = new (EdgeTemporaryMixin(Edge))({});

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

    insertNode(node) {
        // Validação
        if (!(node)) {
            console.error("Inserção de nó chamada incorretamente.");
            return;
        }
        if (this.debug) {
            debugPrint("Inserindo nó", node)
        }
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
        for (let [, nodeA, nodeB] of this.edges()) {
            if (nodeB == node) {
                this.removeEdgeBetween(nodeA, nodeB)
            }
        }
        this.data.delete(node)
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
        let serializedNodes = ""
        for(let node of this.nodes())
        {
            serializedNodes += node.serialize() + "."
        }

        let serializedEdged = ""
        for(let [edge, nodeA, nodeB] of this.uniqueEdges())
        {
            serializedEdged += `${nodeA.index}_${nodeB.index}-${edge.serialize()}.`
            // pairs.push([nodeA.index,nodeB.index])
        }

        return serializedNodes + "~" + serializedEdged
    }

    static deserialize(string, clone = false) {
        resetColorRotation()
        let graph = new this()
        graph.debug = !clone;
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
                const [, nodeA, nodeB, edgeData] = found;
                // console.log("graph edge", nodeA, nodeB, edgeData)
                let ne = Edge.deserialize(edgeData)
                graph.insertEdge(
                    deserializedNodes.find(n => n.index === parseInt(nodeA)),
                    deserializedNodes.find(n => n.index === parseInt(nodeB)),
                    ne
                )
            }
        }
        if (this.debug) {
            console.info("Grafo desserializado com sucesso.");
        }
        return graph
    }

    _cloneData() {
        let tempGraph = new this.constructor()
        tempGraph.debug = false;
        let newNodeMap = new Map()
        for(let node of this.nodes()) {
            let newNode = node.clone()
            newNodeMap.set(node, newNode)
            tempGraph.insertNode(newNode)
        }

        for(let [edge, nodeA, nodeB] of this.uniqueEdges())
        {
            let newEdge = edge.clone()
            tempGraph.insertEdge(newNodeMap.get(nodeA), newNodeMap.get(nodeB), newEdge)
        }
        return tempGraph.data
    }

    clone () {
        return new this.constructor(this._args)
    }

    cloneAndTransform ({EdgeConstructor = this.EdgeConstructor, NodeConstructor = this.NodeConstructor}) {
        let newGraph = new this.constructor({EdgeConstructor: EdgeConstructor, NodeConstructor: NodeConstructor})
        newGraph.debug = false;
        let newNodeMap = new Map()
        for(let node of this.nodes()) {
            let newNode = NodeConstructor.from(node)
            newNodeMap.set(node, newNode)
            newGraph.insertNode(newNode)
        }

        for(let [edge, nodeA, nodeB] of this.uniqueEdges())
        {
            let newEdge = EdgeConstructor.from(edge)
            newGraph.insertEdge(newNodeMap.get(nodeA), newNodeMap.get(nodeB), newEdge)
        }

        return newGraph
    }

    static from(graph)
    {
        return new this(graph._args)
    }
}

export default Graph