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
                              "Selecione o nó inicial.",
                              node => {
                                  executeGreedyNodeColoring(controller, node)
                              })
    await controller.resolveRequirements()
}

function executeGreedyNodeColoring(controller, initialNode) {
    let graph = controller.graphView.structure

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