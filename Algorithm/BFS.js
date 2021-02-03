import {NodeHighlightType} from "../Structure/Node.js";
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";

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
    let graph = controller.initialGraph
    let queue = [[startNode, null]]

    let currentNode, currentEdge
    while(queue.length > 0){
        [currentNode, currentEdge] = queue.shift()
        currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        currentNode.visited = true

        if(currentEdge)
        {
            currentEdge.addHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
            controller.addStep(graph, `Visitando o nó ${currentNode.label} a partir da aresta ${currentEdge.label}.`)
        } else {
            controller.addStep(graph, `Visitando o nó ${currentNode.label}.`)
        }


        if(currentEdge)
        {
            // currentEdge.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
        }

        let visitedEdges = []
        for(let [edge, node] of graph.edgesFrom(currentNode))
        {
            if(!node.visited)
            {
                queue.push([node, edge])
                node.visited = true
                edge.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
                visitedEdges.push(edge)
            }
        }
        if(visitedEdges.length > 0)
        {
            controller.addStep(graph, `Explorando as arestas ${visitedEdges.map(e => e.label).join(', ')}.`)
        }

        currentNode.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
    }
    currentNode.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
    controller.addStep(graph, "Algoritmo finalizado.")
}