import {NodeHighlightType} from "../Structure/Node.js";
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";

export default async function DijkstraShortestPath(controller) {
    let initialNode

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
    let graph = controller.initialGraph

    let unvisitedNodes = []
    for(let node of graph.nodes())
    {
        if(node === initialNode)
        {
            node.distance = 0
            node.previousEdge = null
            node.previousNode = null
            node.visited = false
            unvisitedNodes.push(node)
        } else {
            node.distance = Infinity
            node.previousEdge = null
            node.previousNode = null
            node.visited = false
            unvisitedNodes.push(node)
        }
    }
    console.log(graph.serialize())
    controller.addStep(graph, `Marcando todos os nós menos o nó inicial como não visitados e colocando suas distâncias como ∞. O nó inicial é marcado com distância 0.`)
    let currentNode

    while(currentNode !== finalNode && unvisitedNodes.length > 0) {
        currentNode = null

        for(let node of unvisitedNodes)
        {
            if(node.distance < (currentNode?.distance ?? Infinity) && !node.visited)
            {
                currentNode = node
            }
        }
        if(!currentNode) {
            break
        }

        currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        controller.addStep(graph, `Visitando o nó ${currentNode.label}.`)


        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            if(node === currentNode.previousNode)
            {
                continue
            }

            node.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
            edge.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)

            let newDistance = currentNode.distance + (edge?.weight ?? 1)
            if(newDistance < node.distance) {
                node.distance = newDistance
                node.previousEdge = edge
                node.previousNode = currentNode

                controller.addStep(graph, `Visitando o nó ${node.label.split(' ')[0]} a partir da aresta ${edge.label}, atualizando sua distância para ${newDistance} e salvando a aresta ${edge.label} como a aresta anterior no caminho.`)
            } else {
                controller.addStep(graph, `Visitando o nó ${node.label.split(' ')[0]} a partir da aresta ${edge.label}, sua distância já é menor portanto não será atualizada.`)
            }
            node.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
            edge.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        }
        currentNode.visited = true
        currentNode.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
        controller.addStep(graph, `Concluindo a visitação do nó ${currentNode.label.split(' ')[0]} e o marcando como visitado.`)
    }
    if(currentNode === finalNode)
    {
        controller.addStep(graph, 'Nó final foi visitado portanto as visitações estão concluídas.')
    } else {
        controller.addStep(graph, 'Não sobrou nenhum nó com distância menor que ∞ e portanto a visitação foi concluída.')
    }

    currentNode = finalNode
    while(currentNode !== null)
    {
        currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        console.log(currentNode)
        if(currentNode.previousEdge)
        {
            currentNode.previousEdge.addHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
        }
        currentNode = currentNode.previousNode
    }
    controller.addStep(graph, 'Caminhando pelas distâncias mais curtas para encontrar o menor caminho. Algoritmo concluído.')
}