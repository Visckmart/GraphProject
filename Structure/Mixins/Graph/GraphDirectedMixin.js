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

let GraphDirectedMixin = (superclass) => {
    return class DirectedGraph extends  superclass {
        constructor(args) {
            super(args);

            this.mixins.add(GraphDirectedMixin)
            this.categories.add("directed_edges");
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