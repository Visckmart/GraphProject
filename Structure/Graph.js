import { GraphCategory, resetColorRotation } from "../Drawing/General.js";

import Node from "./Node.js";

import Edge from "./Edge.js";
import EdgeTemporaryMixin from "./Mixins/Edge/EdgeTemporaryMixin.js";
import EdgeAssignedValueMixin from "./Mixins/Edge/EdgeAssignedValueMixin.js";


class Graph {
    constructor({ data = new Map(), EdgeConstructor = Edge, NodeConstructor = Node } = {}) {
        this.data = data
        this.debug = false
        this.categories = new Set();

        // Guardando construtores de elementos do grafo
        this.EdgeConstructor = EdgeConstructor
        this.NodeConstructor = NodeConstructor

        // Lista de mixins
        this.mixins = new Set()
    }

    get _args() {
        return {
            data: this._cloneData(),
            EdgeConstructor: this.EdgeConstructor,
            NodeConstructor: this.NodeConstructor
        }
    }

    getCategories() {
        return {
            weightedEdges: this.categories.has(GraphCategory.WEIGHTED_EDGES),
            coloredEdges:  this.categories.has(GraphCategory.COLORED_EDGES),
            directedEdges: this.categories.has(GraphCategory.DIRECTED_EDGES)
        }
    }

    //region Manipulação do Grafo

    // Inserção
    insertEdgeBetween(nodeA, nodeB) {
        if (this.checkEdgeBetween(nodeA, nodeB)) {
            return;
        }
        let edge = new this.EdgeConstructor()
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
        return edge;
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
            debugPrint("Inserindo aresta " + edge.label + " do nó " + nodeA.label +
                       " até o nó " + nodeB.label, edge);
        }

        // Operação
        this.data.get(nodeA).set(nodeB, edge);
        this.data.get(nodeB).set(nodeA, edge);
    }

    // Criando aresta temporária
    temporaryEdge = new (EdgeTemporaryMixin(Edge))();

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
    //endregion

    //region Deteção de Nós e Arestas

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
    //endregion

    //region Serialização

    serialize() {
        let graphType = "";
        if (this.EdgeConstructor == Edge) {
            // console.log("Regular edges")
        } else {
            graphType = "W";
            // console.log("Weighted edges")
        }

        let serializedNodes = "";
        for(let node of this.nodes()) {
            serializedNodes += `${node.serialize()}.`
        }

        let serializedEdges = "";
        for(let [edge, nodeA, nodeB] of this.uniqueEdges()) {
            serializedEdges += `${nodeA.index}_${nodeB.index}-${edge.serialize()}.`
        }

        return graphType + serializedNodes + "~" + serializedEdges;
    }

    static deserialize(serialized, clone = false) {
        if (serialized.indexOf("~") < 0) { return; }
        resetColorRotation();
        let typeChar = serialized.charAt(0);
        let edgeConstructor = Edge;
        if (typeChar == "W") {
            edgeConstructor = EdgeAssignedValueMixin(Edge)
        }
        // console.log(edgeConstructor)
        let graph = new this({ EdgeConstructor: edgeConstructor });
        graph.debug = !clone;
        if (typeChar == "W") {
            graph.categories.add(GraphCategory.WEIGHTED_EDGES);
        }

        let [serializedNodes, serializedEdges] = serialized.split("~")
        let deserializedNodes = []
        if (serializedNodes) {
            let serializedNodesList = serializedNodes.split(".")
            serializedNodesList.splice(-1, 1)
            for (let nodeStr of serializedNodesList) {
                let node = Node.deserialize(nodeStr)
                if (node == undefined) continue;
                deserializedNodes.push(node)
                graph.insertNode(node)
            }
        }

        if (serializedEdges) {
            let serializedEdgesList = serializedEdges.split(".")
            serializedEdgesList.splice(-1, 1)
            for (let edgeStr of serializedEdgesList) {
                const re = /(\d+)_(\d+)-(.*)/i;
                let found = edgeStr.match(re);
                if (found == undefined) continue;

                const [, nodeA, nodeB, edgeData] = found;
                let deserializedEdge = graph.EdgeConstructor.deserialize(edgeData)

                graph.insertEdge(
                    deserializedNodes.find(n => n.index === parseInt(nodeA)),
                    deserializedNodes.find(n => n.index === parseInt(nodeB)),
                    deserializedEdge
                )
            }
        }
        if (this.debug) {
            console.info("Grafo desserializado com sucesso.");
        }
        return graph;
    }

    _cloneData() {
        let tempGraph = new this.constructor();
        tempGraph.debug = false;

        let newNodeMap = new Map()
        for (let node of this.nodes()) {
            let newNode = node.clone()
            newNodeMap.set(node, newNode)

            tempGraph.insertNode(newNode)
        }

        for(let [edge, nodeA, nodeB] of this.uniqueEdges()) {
            let newEdge = edge.clone()
            // TODO: aparentemente nodeA e newNodeMap.get(nodeA) é a mesma coisa
            tempGraph.insertEdge(newNodeMap.get(nodeA), newNodeMap.get(nodeB),
                                 newEdge)
        }
        return tempGraph.data;
    }

    clone () {
        return new this.constructor(this._args);
    }

    cloneAndTransform ({EdgeConstructor = this.EdgeConstructor, NodeConstructor = this.NodeConstructor}) {
        let newGraph = new this.constructor({
                                                EdgeConstructor: EdgeConstructor,
                                                NodeConstructor: NodeConstructor
                                            })
        newGraph.debug = false;
        let newNodeMap = new Map()
        for(let node of this.nodes()) {
            let newNode = NodeConstructor.from(node)
            newNodeMap.set(node, newNode)

            newGraph.insertNode(newNode)
        }

        for(let [edge, nodeA, nodeB] of this.uniqueEdges()) {
            let newEdge = EdgeConstructor.from(edge)
            newGraph.insertEdge(newNodeMap.get(nodeA), newNodeMap.get(nodeB),
                                newEdge)
        }

        return newGraph;
    }
    //endregion

    //region Iteradores
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
        for(let [nodeB, edge] of this.data.get(node))  {
            yield [edge, nodeB]
        }
    }
    //endregion

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

    static from(graph) {
        return new this(graph._args)
    }
}

export default Graph