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
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import NodeColorMixin from "../Structure/Mixins/Node/NodeColorMixin.js";
import { nodeColorList } from "../Drawing/General.js";

export default async function GreedyNodeColoring(controller) {
    let initialNode
    /* Esse algoritmo usa nós com assignedValue para visualização */
    controller.graphView.structure = cloneTransformNodes(controller.graphView.structure, NodeColorMixin)
    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione um nó inicial.<br><i>Pular esse requisito implica na escolha de um nó" +
        " arbitrário</i>",
        node => initialNode = node,
        true)
    await controller.resolveRequirements()
    executeGreedyNodeColoring(controller, initialNode)
}

function executeGreedyNodeColoring(controller, initialNode = null) {
    let graph = controller.graphView.structure

    if (!initialNode) {
        initialNode = graph.nodes().next().value
        if(!initialNode) return;
    }


    for (let node of graph.nodes()) {
        console.log(node)
        node.color = "#000"
    }
    let usedColors = 1
    initialNode.color = nodeColorList[usedColors]
    initialNode.colorIndex = usedColors
    controller.addStep(graph, "Removendo a cor de todos os nós.<br>Colorindo o nó inicial.")
    let maxColor = 1
    for (let node of graph.nodes()) {
        if (node == initialNode) continue;
        if (node.color != "#000") continue;
        let neighbourColors = []
        for (let [,neighbour] of graph.edgesFrom(node)) {
            let ci = neighbour.colorIndex
            if (ci) {
                neighbourColors.push(ci)
            }
        }
        let stepText;
        // console.log(">", node.label)
        let maiorCor;
        if (neighbourColors.length == 0) {
            // console.log("\tA")
            maiorCor = 0
            stepText = `Não há vizinhos coloridos, a primeira cor foi escolhida para o nó <strong style='color:${nodeColorList[maiorCor+1]}'>${node.label}</strong>.`
        } else if (neighbourColors.length == 1) {
            // console.log("\tB")
            maiorCor = neighbourColors[0] == 1 ? 1 : 0
            stepText = `Há um vizinho colorido, uma cor diferente da dele foi escolhida para o nó <strong style='color:${nodeColorList[maiorCor+1]}'>${node.label}</strong>.`
        } else {
            // console.log("\tC")
            // = Math.max(...neighbourColors)
            // console.log(neighbourColors)
            neighbourColors.sort()
            console.log(node.label, neighbourColors)
            maiorCor = neighbourColors[neighbourColors.length-1]
            for (let i = 0; i < neighbourColors.length-1; i++) {
                if (neighbourColors[i] == neighbourColors[i+1]) continue;
                if (neighbourColors[i] + 1 != neighbourColors[i+1]) {
                    maiorCor = neighbourColors[i]
                }
            }
            stepText = `Uma cor diferente de todos os vizinhos coloridos foi escolhida para o nó <strong style='color:${nodeColorList[maiorCor+1]}'>${node.label}</strong>.`
        }
        if (maiorCor+1 > maxColor) {
            maxColor = maiorCor+1
        }
        node.color = nodeColorList[maiorCor+1]
        node.colorIndex = maiorCor+1
        node.highlights.add(HighlightType.ALGORITHM_VISITING)
        console.log(node.label, node.colorIndex)
        controller.addStep(graph, stepText)
        node.highlights.remove(HighlightType.ALGORITHM_VISITING)
    }
    controller.addStep(graph, `Grafo colorido com ${maxColor} cores.<br><i>Nota: ${maxColor} não necessariamente é o número cromático, uma vez que podem haver colorações melhores.</i>`)
    // console.log(1)
}