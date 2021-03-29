import { HighlightType } from "../Structure/Highlights.js"
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";
import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import {MinHeap} from "./Auxiliary/Heap.js";
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
    controller.addStep(graph, "Escolhendo uma cor inicial.")

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
        console.log(">", node.label)
        let maiorCor;
        if (neighbourColors.length == 0) {
            console.log("\tA")
            maiorCor = 0
        } else if (neighbourColors.length == 1) {
            console.log("\tB")
            maiorCor = neighbourColors[0] == 1 ? 1 : 0
        } else {
            console.log("\tC")
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
        }
        node.color = nodeColorList[maiorCor+1]
        node.colorIndex = maiorCor+1
        console.log(node.label, node.colorIndex)
        controller.addStep(graph, "Escolhendo uma cor inicial.")
    }
    // console.log(1)
}