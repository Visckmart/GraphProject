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

// Prepara a execução do BFS
export default async function BFS(controller)
{
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó de inicio para a o BFS",
        (startNode) => {
        executeBFS(controller, startNode)
    })
    await controller.resolveRequirements()
}

// Executa o BFS
function executeBFS(controller, startNode)
{
    let graph = controller.graph
    let queue = [[startNode, null]]

    let currentNode, currentEdge
    while(queue.length > 0){
        [currentNode, currentEdge] = queue.shift()
        currentNode.addHighlight(HighlightType.DARK_WITH_BLINK)
        currentNode.visited = true

        if(currentEdge)
        {
            currentEdge.addHighlight(HighlightType.LIGHTEN)
            controller.addStep(graph, `Visitando o nó ${currentNode.label} a partir da aresta ${currentEdge.label}.`)
        } else {
            controller.addStep(graph, `Visitando o nó ${currentNode.label}.`)
        }


        if(currentEdge)
        {
            // currentEdge.removeHighlight(HighlightType.ALGORITHM_FOCUS2)
        }

        let visitedEdges = []
        for(let [edge, node] of graph.edgesFrom(currentNode))
        {
            if(!node.visited)
            {
                queue.push([node, edge])
                node.visited = true
                edge.addHighlight(HighlightType.DARK_WITH_BLINK)
                visitedEdges.push(edge)
            }
        }
        if(visitedEdges.length > 0)
        {
            controller.addStep(graph, `Explorando as arestas ${visitedEdges.map(e => e.label).join(', ')}.`)
        }

        currentNode.removeHighlight(HighlightType.DARK_WITH_BLINK)
    }
    currentNode.removeHighlight(HighlightType.DARK_WITH_BLINK)
    controller.addStep(graph, "Algoritmo finalizado.")
}