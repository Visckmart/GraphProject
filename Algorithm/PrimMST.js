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

import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import {HighlightType} from "../Utilities/Highlights.js";
import {MinHeap} from "./Auxiliary/Heap.js";
import pseudocode from "../Algorithm/Pseudocodes/PrimMST.htm";

function markArtifactAsUnreached(artifact) {
    artifact.highlights.add(HighlightType.DISABLED)
}

function markArtifactAsReached(artifact) {
    artifact.highlights.remove(HighlightType.DISABLED)
    artifact.highlights.add(HighlightType.DARKEN)
}

function toggleArtifactActive(artifact) {
    if(artifact.highlights.has(HighlightType.LIGHTEN))
    {
        artifact.highlights.remove(HighlightType.LIGHTEN)
    } else {
        artifact.highlights.add(HighlightType.LIGHTEN)
    }
}

function toggleArtifactExploring(artifact) {
    if(artifact.highlights.has(HighlightType.ALGORITHM_VISITING)) {
        artifact.highlights.remove(HighlightType.ALGORITHM_VISITING)
    } else {
        artifact.highlights.add(HighlightType.ALGORITHM_VISITING)
    }
}

export default function PrimMST(controller) {
    /* Esse algoritmo usa nós com assignedValue para visualização */
    controller.graphView.structure = cloneTransformNodes(controller.graphView.structure, NodeAssignedValueMixin)
    controller.setPseudocode(pseudocode)

    let graph = controller.graphView.structure


    let node
    for(node of graph.nodes()) {
        node.distance = Infinity
        node.assignedValue = '∞'
        node.previousEdge = null

        markArtifactAsUnreached(node)
    }

    // Marcando todas as arestas como não inclusas
    for(let [edge,,] of graph.uniqueEdges())
    {
        markArtifactAsUnreached(edge)
    }

    controller.addStep(graph,
        'Marcando todos os nós do grafo com distância ∞ e sem aresta anterior',
        'init')

    node.distance = 0
    node.assignedValue = '0'
    controller.addStep(graph,
        'Marcando um nó arbitrário como nó inicial e colocando sua distância como 0')

    /* Inicializando estrutura de heap auxiliar */
    let heap = new MinHeap()
    controller.showcasing = heap

    for(let node of graph.nodes()) {
        heap.insert(node, node.distance)
    }


    let currentNode
    while(true) {
        currentNode = heap.remove()
        if(!currentNode || currentNode.distance === Infinity) {
            break
        }

        toggleArtifactActive(currentNode)
        if(currentNode.previousEdge) {
            toggleArtifactActive(currentNode.previousEdge)
        }

        currentNode.included = true
        currentNode.assignedValue = ''
        controller.addStep(graph,  `Incluindo o nó ${currentNode.label}`, 'initLoop')

        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            if(edge === currentNode.previousEdge || node.included)
            {
                continue
            }
            toggleArtifactExploring(edge)
            toggleArtifactExploring(node)

            let newDistance = Number.parseFloat(edge.assignedValue)

            controller.addStep(graph, `Inspecionando a aresta de peso ${newDistance}`, 'inspectEdge')
            if(Number.isNaN(newDistance)) {
                throw  new Error("Peso inválido na aresta")
            }
            if(newDistance < node.distance) {
                node.assignedValue = newDistance.toString()
                node.previousEdge = edge

                controller.addStep(graph,
                    `A distância atual ${node.distance === Infinity ? '∞':node.distance} é maior que a\
                     distância ${newDistance} potencial e portanto será atualizada para ${newDistance}.`,
                    'update')
                node.distance = newDistance

                // Atualizando valor no heap
                heap.changeValue(node, node.distance)
            } else {
                controller.addStep(graph,
                    `A distância atual ${node.distance} já é menor que a nova distância\
                     ${newDistance} e portanto será mantida.`,
                    'noUpdate')
            }
            toggleArtifactExploring(edge)
            toggleArtifactExploring(node)
        }

        toggleArtifactActive(currentNode)
        markArtifactAsReached(currentNode)
        if(currentNode.previousEdge) {
            toggleArtifactActive(currentNode.previousEdge)
            markArtifactAsReached(currentNode.previousEdge)
        }
    }
    let treeCompleted = true
    for(let node of graph.nodes())
    {
        if(node.distance === Infinity)
        {
            treeCompleted = false
        }
    }

    if(treeCompleted) {
        for(let [edge,,] of graph.edges()) {
            if(!edge.highlights.has(HighlightType.DISABLED)) {
                edge.highlights.add(HighlightType.DARK_WITH_BLINK)
            }
        }

        controller.addStep(graph, 'Árvore geradora mínima encontrada!', 'found')
    } else {
        controller.addStep(graph,
            'O grafo não é conexo portanto não há árvore geradora mínima.',
            'notFound')
    }
}