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

import { HighlightType } from "../Utilities/Highlights.js"
import {RequirementType} from "./Control/AlgorithmRequirements.js";
import Stack from "./Auxiliary/Stack.js";

// Prepara a execução do BFS
export default async function BFS(controller)
{
    let startNode;
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó de inicio para a o DFS",
        (node) => startNode = node)
    await controller.resolveRequirements()
    executeDFS(controller, startNode)
}

class nodeEdgePair {
    constructor(node, edge) {
        this.node = node
        this.edge = edge
    }
    toString () {
        return this.node.toString()
    }

}

// Executa o BFS
function executeDFS(controller, startNode)
{
    controller.setPseudocode('../Algorithm/Pseudocodes/DFS.html')

    let graph = controller.graphView.structure
    let stack = new Stack()
    controller.showcasing = stack
    stack.push(new nodeEdgePair(startNode, null))

    // Highlight para nós que não foram descobertos
    for(let node of graph.nodes()) {
        node.highlights.add(HighlightType.DISABLED)
    }

    controller.addStep(graph, `Adicionando o nó inicial ${startNode.toString()} na pilha.`, 'init')

    let currentNode, currentEdge
    outerLoop: while(stack.length > 0){
        ({node: currentNode, edge: currentEdge} = stack.pop())

        currentNode.highlights.add(HighlightType.COLORED_BORDER2)
        currentNode.visited = true

        if(currentEdge)
        {
            currentEdge.highlights.add(HighlightType.COLORED_A)
            controller.addStep(graph, `Visitando o nó ${currentNode.toString()}.`, 'loopStart')
            currentEdge.highlights.remove(HighlightType.COLORED_A)
            currentEdge.highlights.add(HighlightType.LIGHTEN)
        } else {
            // Removendo highlight para o primeiro nó
            currentNode.highlights.remove(HighlightType.DISABLED)

            controller.addStep(graph, `Visitando o nó ${currentNode.toString()}.`, 'loopStart')
        }
        currentNode.highlights.remove(HighlightType.COLORED_BORDER2)

        for(let [edge, node] of graph.edgesFrom(currentNode))
        {

            if(!node.visited)
            {
                stack.push(new nodeEdgePair(currentNode, currentEdge))
                stack.push(new nodeEdgePair(node, edge))

                // Removendo highlight para nós descobertos
                node.highlights.remove(HighlightType.DISABLED)

                edge.highlights.add(HighlightType.COLORED_A)
                controller.addStep(graph, `Adicionando o nó ${currentNode.toString()} na pilha e partindo para o nó ${node.toString()}.`, 'visitStart')
                edge.highlights.remove(HighlightType.COLORED_A)
                continue outerLoop;
            }
        }
        currentNode.highlights.add(HighlightType.COLORED_BORDER2)
        controller.addStep(graph, `Nó ${currentNode.toString()} não tem mais vizinhos não visitados.`, 'visitStart')
        currentNode.highlights.remove(HighlightType.COLORED_BORDER2)
    }
    currentNode.highlights.remove(HighlightType.DARK_WITH_BLINK)
    controller.addStep(graph, "Algoritmo finalizado.")
}