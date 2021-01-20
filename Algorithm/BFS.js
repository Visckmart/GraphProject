import AlgorithmController from "../Drawing/AlgorithmControls/AlgorithmController.js";
import {NodeHighlightType} from "../Structure/Node.js";


export default function BFS(controller, startNode)
{
    let graph = controller.initialGraph

    let queue = [startNode]

    let lastNode = null
    let currentNode = null
    while(queue.length > 0){
        if(currentNode)
        {
            lastNode = currentNode
            lastNode.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        }

        currentNode = queue.shift()
        if(currentNode)
        {
            currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
            currentNode.visited = true
        } else {
            break
        }

        controller.addStep(graph)

        let anyEdges = false
        for(let [edge, node] of graph.edgesFrom(currentNode))
        {
            if(!node.visited)
            {
                queue.push(node)
                node.visited = true
                edge.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
                anyEdges = true
            }
        }
        if(anyEdges)
        {
            controller.addStep(graph)
        }
    }
}