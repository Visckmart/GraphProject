/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { canvas, GraphCategory, incrementGlobalIndex } from "../Drawing/General.js";

import Node from "./Node.js";

import Edge from "./Edge.js";
import EdgeTemporaryMixin from "./Mixins/Edge/EdgeTemporaryMixin.js";
import EdgeAssignedValueMixin from "./Mixins/Edge/EdgeAssignedValueMixin.js";
import NodeColorMixin from "./Mixins/Node/NodeColorMixin.js";
import EdgeDirectedMixin from "./Mixins/Edge/EdgeDirectedMixin.js";
import GraphDirectedMixin from "./Mixins/Graph/GraphDirectedMixin.js";


class Graph {
    constructor({   data = new Map(),
                    EdgeConstructor = Edge, NodeConstructor = NodeColorMixin(Node),
                    categories = null, debug = true } = {}) {
        this.data = new Map();
        this.importData(data)
        // console.log("constructor", categories);
        // console.trace();
        this.categories = categories ?? new Set();
        this.debug = debug;

        // Guardando construtores de elementos do grafo
        this.EdgeConstructor = EdgeConstructor;
        this.NodeConstructor = NodeConstructor;

        this.temporaryEdge = new (EdgeTemporaryMixin(EdgeConstructor))();

        // Lista de mixins
        this.mixins = new Set();
    }

    get _args() {
        return {
            data: this.data,
            EdgeConstructor: this.EdgeConstructor,
            NodeConstructor: this.NodeConstructor,
            categories: this.categories
        }
    }

    importData(data = new Map()) {
        let oldNodeMap = new Map()
        for(let node of data.keys()) {
            let newNode = node.clone()
            oldNodeMap.set(node, newNode)
            this.insertNode(newNode)
        }
        for(let [nodeA, nodeMap] of data.entries()) {
            for(let [nodeB, edge] of nodeMap.entries()) {
                this.insertEdge(oldNodeMap.get(nodeA),
                                oldNodeMap.get(nodeB),
                                edge.clone())
            }
        }
    }

    // TODO: Melhorar
    getCategories() {
        return this.categories;
    }
    static getConstructorsFromCategories(categories) {
        let NodeType = Node;
        let EdgeType = Edge;
        let GraphType = Graph;

        if (categories.includes(GraphCategory.COLORED_NODES)) {
            NodeType = NodeColorMixin(NodeType);
        }

        if(categories.includes(GraphCategory.WEIGHTED_EDGES)) {
            EdgeType = EdgeAssignedValueMixin(EdgeType);
        }
        if(categories.includes(GraphCategory.COLORED_EDGES)) {
            //TODO: Mixin de edge colorido
        }
        if(categories.includes(GraphCategory.DIRECTED_EDGES)) {
            EdgeType = EdgeDirectedMixin(EdgeType);
            GraphType = GraphDirectedMixin(GraphType);
        }
        return [GraphType, NodeType, EdgeType];
    }

    //region Manipulação do Grafo

    insertNode(node) {
        // Validação
        if (!(node)) {
            console.error("Inserção de nó chamada incorretamente.");
            return false;
        }
        if (this.debug) { console.info(`Inserindo nó ${node}`); }
        console.assert(this.data.has(node) == false, "Nó já estava no grafo.");

        // Operação
        this.data.set(node, new Map());
        return true;
    }

    removeNode(node) {
        // Validação
        if (!(node)) {
            console.error("Remoção de nó chamada incorretamente.");
            return false;
        }
        if (this.debug) { console.info(`Removendo nó ${node}`); }
        console.assert(this.data.has(node) == true, "Nó não está no grafo.");

        // Operação
        // Passa por todas as arestas que chegam no nó e as remove
        for (let [edge, , nodeB] of this.edges()) {
            if (nodeB == node) {
                this.removeEdge(edge);
            }
        }
        this.data.delete(node);
        return true;
    }

    insertEdge(nodeA, nodeB, edge, quiet = false) {
        // Validação
        if (!(nodeA && nodeB)) {
            console.error("Inserção de aresta chamada incorretamente.",
                          nodeA, nodeB, edge)
            return false;
        }
        if (nodeA === nodeB) {
            console.warn("Inserção de aresta que causaria um laço.", nodeA)
            return false;
        }
        if (!this.data.has(nodeA) || !this.data.has(nodeB)) {
            console.warn("Nós não encontrados no grafo")
            return false;
        }

        if (this.debug && quiet == false) {
            console.info(`Inserindo aresta entre os nós ${nodeA} - ${nodeB}`);
        }


        // Operação
        this.data.get(nodeA).set(nodeB, edge);
        this.data.get(nodeB).set(nodeA, edge);
        return true;
    }

    removeEdge(edge) {
        // Validação
        if (!(edge)) {
            console.error("Remoção de uma aresta específica chamada incorretamente.")
            return false;
        }
        if (this.debug) { console.info("Removendo aresta", edge); }

        // Operação
        let anyEdgeRemoved = false;
        // TODO: Considerar usar o iterador uniqueEdges
        for (let [currentEdge, nodeA, nodeB] of this.edges()) {
            if (currentEdge == edge) {
                this.data.get(nodeA).delete(nodeB)
                anyEdgeRemoved = true;
            }
        }
        if (!anyEdgeRemoved) {
            console.warn("A aresta a ser removida não foi encontrada.");
            return false;
        }
        return true;
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

    getEdgeNodes(edge) {
        for(let [nodeA, nodeMap] of this.data.entries()) {
            for(let [nodeB, mapEdge] of nodeMap) {
                if(mapEdge === edge) {
                    return [nodeA, nodeB]
                }
            }
        }
    }

    checkEdgeBetween(nodeA, nodeB) {
        let connA = this.data.get(nodeA);
        if (connA == null) {
            console.warn("Houve uma tentativa de checar uma aresta inexistente.")
            return false;
        }
        return connA.get(nodeB) != null;
    }

    stretchToFill() {
        let left, right, top, bottom;
        for (let node of this.nodes()) {
            if (!left   || left > node.pos.x)   { left = node.pos.x; }
            if (!right  || right < node.pos.x)  { right = node.pos.x; }
            if (!top    || top > node.pos.y)    { top = node.pos.y; }
            if (!bottom || bottom < node.pos.y) { bottom = node.pos.y; }
        }
        let range = { horiz: right - left, vert: bottom - top };

        let marginProportion = { horiz: 0.1, vert: 0.1 };

        let canvasMargin = { horiz: canvas.width * marginProportion.horiz,
                             vert:  canvas.height * marginProportion.vert };
        let canvasContentSpan = { horiz: canvas.width * (1 - marginProportion.horiz * 2),
                                  vert:  canvas.height * (1 - marginProportion.vert * 2) };

        for (let node of this.nodes()) {
            node.pos.x = (node.pos.x - left)/range.horiz;
            node.pos.x = (node.pos.x * canvasContentSpan.horiz) + canvasMargin.horiz;
            node.pos.y = (node.pos.y - top)/range.vert;
            node.pos.y = (node.pos.y * canvasContentSpan.vert) + canvasMargin.vert;
        }
    }
    //endregion

    //region Serialização

    serializeCategories() {
        let serialized = "";
        let nodeMixins = this.NodeConstructor.getMixins();
        if (nodeMixins.has(NodeColorMixin)) { serialized += "c"; }

        let edgeMixins = this.EdgeConstructor.getMixins();
        if (edgeMixins.has(EdgeDirectedMixin))      { serialized += "D"; }
        if (edgeMixins.has(EdgeAssignedValueMixin)) { serialized += "V"; }

        return serialized;
    }
    serialize() {
        let graphType = this.serializeCategories();

        let serializedNodes = "";
        for(let node of this.nodes()) {
            serializedNodes += `${node.serialize()}.`;
        }

        let serializedEdges = "";
        for(let [edge, nodeA, nodeB] of this.uniqueEdges()) {
            serializedEdges += `${nodeA.index}_${nodeB.index}-${edge.serialize()}.`;
        }

        serializedEdges = serializedEdges.slice(0, -1);
        return graphType + serializedNodes + "~" + serializedEdges;
    }

    static deserialize(serialized, clone = false) {
        if (serialized.indexOf("~") < 0) { return; }
        let serializedPrefix = serialized.match(/^([a-zA-Z]+).+?/);
        serialized = serialized + ".";
        let cat = new Set();

        let nodeConstructor = Node
        let edgeConstructor = Edge
        let graphConstructor = Graph
        if(serializedPrefix) {
            let [, serializedCategories] = serializedPrefix;

            if (serializedCategories.includes("c")) {
                nodeConstructor = NodeColorMixin(nodeConstructor)
                cat.add(GraphCategory.COLORED_NODES);
            }

            if (serializedCategories.includes("V")) {
                edgeConstructor = EdgeAssignedValueMixin(edgeConstructor)
                cat.add(GraphCategory.WEIGHTED_EDGES);
            }

            if (serializedCategories.includes("D")) {
                edgeConstructor = EdgeDirectedMixin(edgeConstructor)
                graphConstructor = GraphDirectedMixin(graphConstructor)
                cat.add(GraphCategory.DIRECTED_EDGES)
            }
        }

        let graph = new graphConstructor({
                                             NodeConstructor: nodeConstructor,
                                             EdgeConstructor: edgeConstructor,
                                             categories: cat, debug: !clone
        });

        let [serializedNodes, serializedEdges] = serialized.split("~")
        let deserializedNodes = []
        let biggestIndex = 0;
        if (serializedNodes) {
            let serializedNodesList = serializedNodes.split(".")
            serializedNodesList.splice(-1, 1)
            for (let nodeStr of serializedNodesList) {
                let node = nodeConstructor.deserialize(nodeStr)
                if (node == undefined) continue;
                if (node.index > biggestIndex) biggestIndex = node.index;
                deserializedNodes.push(node)
                graph.insertNode(node)
            }
        }

        incrementGlobalIndex(biggestIndex+1)
        if (serializedEdges) {
            let serializedEdgesList = serializedEdges.split(".")
            serializedEdgesList.splice(-1, 1)
            for (let edgeStr of serializedEdgesList) {
                const re = /(\d+)_(\d+)-(.*)/i;
                let found = edgeStr.match(re);
                if (found == undefined) continue;

                const [, nodeA, nodeB, edgeData] = found;
                let deserializedEdge = edgeConstructor.deserialize(edgeData)

                graph.insertEdge(
                    deserializedNodes.find(n => n.index === parseInt(nodeA)),
                    deserializedNodes.find(n => n.index === parseInt(nodeB)),
                    deserializedEdge
                )
            }
        }
        if (clone == false) {
            console.info("Grafo desserializado com sucesso.");
        }
        return graph;
    }

    clone () {
        return new this.constructor(this._args);
    }

    cloneAndTransform ({EdgeConstructor = this.EdgeConstructor, NodeConstructor = this.NodeConstructor}) {
        let newGraph = new this.constructor({
                                                EdgeConstructor: EdgeConstructor,
                                                NodeConstructor: NodeConstructor,
                                                categories: this.categories, debug: this.debug,
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

        newGraph.debug = this.debug;
        return newGraph;
    }
    //endregion

    getAnyNode() {
        return this.nodes().next().value;
    }
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
        if(!this.data.has(node)) {
            return
        }
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