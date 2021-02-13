import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import {HighlightType} from "../Structure/Highlights.js";
import {MinHeap} from "./Auxiliary/Heap.js";

function markArtifactAsUnreached(artifact) {
    artifact.highlights.add(HighlightType.ALGORITHM_NOTVISITED)
}

function markArtifactAsReached(artifact) {
    artifact.highlights.remove(HighlightType.ALGORITHM_NOTVISITED)
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

    controller.addStep(graph, 'Marcando todos os nós do grafo com distância ∞ e sem aresta anterior')

    node.distance = 0
    node.assignedValue = '0'
    controller.addStep(graph, 'Marcando um nó arbitrário como nó inicial e colocando sua distância como 0')

    /* Inicializando estrutura de heap auxiliar */
    let heap = new MinHeap()
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

        controller.addStep(graph,  `Incluindo o nó ${currentNode.label}`)
        currentNode.included = true

        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            if(edge === currentNode.previousEdge || node.included)
            {
                continue
            }
            toggleArtifactExploring(edge)
            toggleArtifactExploring(node)

            let newDistance = edge.assignedValue
            if(newDistance < node.distance) {
                node.assignedValue = newDistance.toString()
                node.previousEdge = edge

                controller.addStep(graph, `A distância atual ${node.distance === Infinity ? '∞':node.distance} é maior que a distância ${newDistance} potencial e portanto será atualizada para ${newDistance}.`)
                node.distance = newDistance

                // Atualizando valor no heap
                heap.changeValue(node, node.distance)
            } else {
                controller.addStep(graph, `A distância atual ${node.distance} já é menor que a nova distância ${newDistance} e portanto será mantida.`)
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
        controller.addStep(graph, 'Árvore geradora mínima encontrada!')
    } else {
        controller.addStep(graph, 'O grafo não é conexo portanto não há árvore geradora mínima.')
    }
}