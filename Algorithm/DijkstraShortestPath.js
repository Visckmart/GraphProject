import { HighlightType } from "../Structure/Highlights.js"
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";
import Edge from "../Structure/Edge.js";
import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import {MinHeap} from "./Auxiliary/Heap.js";

function markAsActive(artifact) {
    artifact.highlights.add(HighlightType.LIGHTEN)
}
function markAsNotActive(artifact) {
    artifact.highlights.remove(HighlightType.LIGHTEN)
}

function markAsNotVisited(artifact) {
    artifact.highlights.add(HighlightType.ALGORITHM_NOTVISITED)
}
function markAsVisited(artifact) {
    if (artifact instanceof Edge) {
        artifact.highlights.remove(HighlightType.ALGORITHM_VISITING)
    }
    artifact.highlights.add(HighlightType.DARKEN)
}

function markAsVisiting(artifact) {
    artifact.highlights.add(HighlightType.ALGORITHM_VISITING)
}

export default async function DijkstraShortestPath(controller) {
    let initialNode
    /* Esse algoritmo usa nós com assignedValue para visualização */
    controller.graphView.structure = cloneTransformNodes(controller.graphView.structure, NodeAssignedValueMixin)

    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó de inicio.",
        node => initialNode = node)

    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó final.",
        node => {
            executeDijkstraShortestPath(controller, initialNode, node)
        })
    await controller.resolveRequirements()
}

function executeDijkstraShortestPath(controller, initialNode, finalNode) {
    let graph = controller.graphView.structure

    /* Inicializando heap secundário */
    let heap = new MinHeap()
    controller.showcasing = heap

    initialNode.distance = 0
    initialNode.previousEdge = null
    initialNode.previousNode = null
    initialNode.visited = false
    initialNode.assignedValue = '0'

    for (let node of graph.nodes()) {
        if (node !== initialNode) {
            node.distance = Infinity
            node.previousEdge = null
            node.previousNode = null
            node.visited = false
            node.assignedValue = '∞'
        }
        heap.insert(node, node.distance)
    }
    // console.log(graph.serialize())
    // console.log(graph)
    // Adiciona um efeito de tracejado em todas as arestas
    for (let [edge, , ] of graph.uniqueEdges()) {
        markAsNotVisited(edge)
        // console.log("e", edge)
    }

    controller.addStep(graph, `Marcando todos os nós menos o nó inicial como não visitados e colocando suas distâncias como ∞.\nO nó inicial é marcado com distância 0.`)


    let currentNode;
    while (currentNode !== finalNode) {
        currentNode = heap.remove();
        if (!currentNode || currentNode.distance === Infinity) {
            break;
        }

        // currentNode.addHighlight(HighlightType.ALGORITHM_FOCUS2)
        markAsActive(currentNode)
        
        // Código muito confuso e possivelmente com problema que não cria um
        // passo visitando um nó se ele não tem pra onde ir.
        // Pode ser que valha a pena visitar pra dizer que tentou ir pra algum lugar.
        let connectedEdges = graph.edgesFrom(currentNode)
        if (!(connectedEdges.next() !== currentNode.previousNode && connectedEdges.next().done)) {
            controller.addStep(graph, `Começando a visitação do nó ${currentNode.label}.`)
        }


        // Passa por todos os nós conectados ao atual
        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            // Ignora o nó anterior
            if(node === currentNode.previousNode) {
                continue
            }

            markAsVisited(node)
            markAsVisiting(edge)
            // edge.addHighlight(HighlightType.ALGORITHM_FOCUS)

            // console.log(currentNode.label + "->" + node.label, currentNode.highlights)
            
            let newDistance = currentNode.distance + Number.parseFloat(edge?.assignedValue ?? 1)
            // Se a distância atual é menor que a registrada
            if(newDistance < node.distance) {
                let oldDistance = node.distance

                node.distance = newDistance
                node.assignedValue = newDistance.toString()
                node.previousEdge = edge
                node.previousNode = currentNode

                // Atualizando peso
                heap.changeValue(node, node.distance)

                controller.addStep(graph, `Analisando a distância do nó ${currentNode.label} até ${node.label}, atualizando sua distância para ${newDistance}, que é menor que a distância atual ${oldDistance === Infinity ? '∞' : oldDistance}, e salvando a aresta destacada como a aresta anterior no caminho.`)

            // Se a distância atual NÃO é menor que a registrada
            } else {
                controller.addStep(graph, `Analisando a distância do nó ${currentNode.label} até ${node.label}, sua distância ${node.distance} é menor ou igual a nova distância ${newDistance} e portanto não será atualizada.`)
            }
            markAsVisited(edge)
        }

        currentNode.visited = true
        markAsNotActive(currentNode)
        markAsVisited(currentNode)
        if (currentNode === initialNode) {
            initialNode.highlights.add(HighlightType.DARK_WITH_BLINK)
        }
        // currentNode.removeHighlight(HighlightType.ALGORITHM_FOCUS)
        // currentNode.removeHighlight(HighlightType.ALGORITHM_FOCUS2)
        // currentNode.addHighlight(HighlightType.ALGORITHM_VISITED)
        // controller.addStep(graph, `Concluindo a visitação do nó ${currentNode.label.split(' ')[0]} e o marcando como visitado.`)
    }
    let textoPassoFinal;
    finalNode.highlights.add(HighlightType.DARK_WITH_BLINK)
    if(currentNode === finalNode) {
        textoPassoFinal = 'Nó final foi visitado portanto as visitações estão concluídas.\nCaminhando pelas distâncias mais curtas para encontrar o menor caminho.'
        currentNode = finalNode
        while(currentNode !== null)
        {
            currentNode.highlights.add(HighlightType.COLORED_BORDER)
            if(currentNode.previousEdge) {
                currentNode.previousEdge.highlights.add(HighlightType.COLORED_BORDER)
            }
            currentNode = currentNode.previousNode
        }
    } else {
        textoPassoFinal = 'Não sobrou nenhum nó alcançável com distância menor que ∞, portanto a visitação foi concluída.'
    }
    controller.addStep(graph, textoPassoFinal + ' Algoritmo concluído.')
}