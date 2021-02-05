import {NodeHighlightType} from "../Structure/Node.js";
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";
import Edge from "../Structure/Edge.js";
import NodeAssignedValueMixin from "../Structure/Mixins/NodeAssignedValueMixin.js";

function markAsActive(artifact) {
    artifact.addHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
}
function markAsNotActive(artifact) {
    artifact.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
}

function markAsNotVisited(artifact) {
    artifact.addHighlight(NodeHighlightType.ALGORITHM_NOTVISITED)
}
function markAsVisited(artifact) {
    if (artifact instanceof Edge) {
        artifact.removeHighlight(NodeHighlightType.ALGORITHM_VISITING)
    }
    artifact.addHighlight(NodeHighlightType.ALGORITHM_VISITED)
}

function markAsVisiting(artifact) {
    artifact.addHighlight(NodeHighlightType.ALGORITHM_VISITING)
}

// function removeVisitingMark(artifact) {
//     .removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
//             edge.addHighlight(NodeHighlightType.ALGORITHM_VISITED)

export default async function DijkstraShortestPath(controller) {
    let initialNode

    // Pegando o primeiro nó para gerar a classe baseado no seu construtor
    let node = controller.graphView.structure.nodes().next().value
    // Se esse nó não tem valor assinalado transforma o grafo para um com nós com valor assinalado
    if(!node.assignedValue)
    {
        // Recriando o grafo agora com nós com valor assinalado
        controller.graphView.structure =
            controller.graphView.structure.cloneAndTransform(null, NodeAssignedValueMixin(node.constructor))
        controller.graphView.redrawGraph()
    }

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
        currentNode = null;

        for(let node of graph.nodes()) {
            let currentNodeDistance = currentNode?.distance ?? Infinity
            if (!node.visited && node.distance < currentNodeDistance) {
                currentNode = node;
            }
        }
        if (!currentNode) {
            break;
        }
        // currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
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
            // edge.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)

            // console.log(currentNode.label + "->" + node.label, currentNode.highlights)
            
            let newDistance = currentNode.distance + (edge?.weight ?? 1)
            // Se a distância atual é menor que a registrada
            if(newDistance < node.distance) {
                let oldDistance = node.distance

                node.distance = newDistance
                node.assignedValue = newDistance.toString()
                node.previousEdge = edge
                node.previousNode = currentNode

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
            initialNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        } else if (currentNode === finalNode) {
            finalNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        }
        // currentNode.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        // currentNode.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
        // currentNode.addHighlight(NodeHighlightType.ALGORITHM_VISITED)
        // controller.addStep(graph, `Concluindo a visitação do nó ${currentNode.label.split(' ')[0]} e o marcando como visitado.`)
    }
    if(currentNode === finalNode) {
        controller.addStep(graph, 'Nó final foi visitado portanto as visitações estão concluídas.')
    } else {
        controller.addStep(graph, 'Não sobrou nenhum nó com distância menor que ∞ e portanto a visitação foi concluída.')
    }

    currentNode = finalNode
    while(currentNode !== null)
    {
        // currentNode.addHighlight(NodeHighlightType.ALGORITHM_FOCUS)
        currentNode.addHighlight(NodeHighlightType.ALGORITHM_RESULT)
        // console.log(currentNode)
        if(currentNode.previousEdge)
        {
            currentNode.previousEdge.addHighlight(NodeHighlightType.ALGORITHM_RESULT)
        }
        currentNode = currentNode.previousNode
    }
    controller.addStep(graph, 'Caminhando pelas distâncias mais curtas para encontrar o menor caminho. Algoritmo concluído.')
}