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

    // Preparando a relação entre distance e assignedValue
    for (let node of graph.nodes()) {
        Object.defineProperty(node, 'distance', {
            get: function () {
                return node._distance;
            },
            set: function (dist) {
                node.assignedValue = dist == Infinity ? "∞" : dist.toString();
                node._distance = dist;
            },
            configurable: true
        });
    }
    /* 1. create vertex set Q */
    /* Inicializando heap secundário */
    let heap = new MinHeap()
    controller.showcasing = heap

    // Preparando visualmente as arestas
    for (let [edge, , ] of graph.uniqueEdges()) {
        markAsNotVisited(edge)
    }

    /*
    2.
    for each vertex v in Graph:
        dist[v] ← INFINITY
        prev[v] ← UNDEFINED
        add v to Q
    dist[source] ← 0
    */

    // Preparando nó inicial
    initialNode.distance = 0
    initialNode.previous = {edge: null, node: null}

    // Preparando os outros nós
    for (let node of graph.nodes()) {
        if (node !== initialNode) {
            node.distance = Infinity
            node.previous = {edge: null, node: null}
        }
        heap.insert(node, node.distance);
    }
    controller.addStep(graph,
                       `Marcando todos os nós menos o nó inicial como não \
                       visitados e colocando suas distâncias como ∞.
                       O nó inicial é marcado com distância 0.`)


    /*
    3.
    while Q is not empty:
        u ← vertex in Q with min dist[u]
        remove u from Q
        ...
     */
    let currentNode = null;
    while (currentNode !== finalNode) {
        currentNode = heap.remove();
        if (!currentNode || currentNode.distance === Infinity) { break; }

        markAsActive(currentNode)


        // Checa se o nó tem vizinhos além do que alcançou ele
        let hasInterestingNeighbours = false;
        for (let [neighbourEdge, ] of graph.edgesFrom(currentNode)) {
            if (neighbourEdge === currentNode.previous.edge) { continue; }
            hasInterestingNeighbours = true;
            break;
        }
        if (hasInterestingNeighbours) {
            controller.addStep(graph,
                               `Começando a visitação do nó ${currentNode.label}.`)
        } else {
            controller.addStep(graph,
                               `Começando a visitação do nó ${currentNode.label}. \
                               Como o nó ${currentNode.label} não tem mais \
                               vizinhos, não há mais nada a fazer.`)
        }

        /*
        4.
        for each neighbor v of u:           // only v that are still in Q
            alt ← dist[u] + length(u, v)
            if alt < dist[v]:
                dist[v] ← alt
                prev[v] ← u
         */
        // Passa por todos os nós conectados ao atual
        for (let [edge, node] of graph.edgesFrom(currentNode)) {
            // Ignora o nó anterior
            if(node === currentNode.previous.node) { continue; }

            markAsVisited(node)
            markAsVisiting(edge)

            let edgeValue = Number.parseFloat(edge?.assignedValue ?? 1)
            let newDistance = currentNode.distance + edgeValue;
            // Se a distância atual é menor que a registrada
            if (newDistance < node.distance) {
                let oldDistance = node.distance === Infinity ? '∞' : node.distance

                node.distance = newDistance
                node.previous = {edge: edge, node: currentNode}

                // Atualizando peso
                heap.changeValue(node, node.distance)

                controller.addStep(graph,
                                   `Analisando a distância do nó \
                                   ${currentNode.label} até ${node.label}, \
                                   atualizando sua distância para ${newDistance}, \
                                   que é menor que a distância atual \
                                   ${oldDistance}, e salvando a aresta destacada \
                                   como a aresta anterior no caminho.`)

            // Se a distância atual NÃO é menor que a registrada
            } else {
                controller.addStep(graph, `Analisando a distância do nó ${currentNode.label} até ${node.label}, sua distância ${node.distance} é menor ou igual a nova distância ${newDistance} e portanto não será atualizada.`)
            }
            markAsVisited(edge)
        }

        markAsNotActive(currentNode)
        markAsVisited(currentNode)
        if (currentNode === initialNode) {
            initialNode.highlights.add(HighlightType.DARK_WITH_BLINK)
        }
    }

    let textoPassoFinal;
    finalNode.highlights.add(HighlightType.DARK_WITH_BLINK)
    if(currentNode === finalNode) {
        textoPassoFinal = 'Nó final foi visitado portanto as visitações estão' +
                          'concluídas.\nCaminhando pelas distâncias mais curtas' +
                          'para encontrar o menor caminho.'

        // Caminhe pelos nós e pelas arestas anteriores, destacando-os
        currentNode = finalNode
        while(currentNode !== null) {
            currentNode.highlights.add(HighlightType.COLORED_BORDER)
            if(currentNode.previous.edge) {
                currentNode.previous.edge.highlights.add(HighlightType.COLORED_BORDER)
            }
            currentNode = currentNode.previous.node
        }
    } else {
        textoPassoFinal = 'Não sobrou nenhum nó alcançável com distância' +
                          'menor que ∞, portanto a visitação foi concluída.'
    }
    controller.addStep(graph, textoPassoFinal + ' Algoritmo concluído.')

    // Removendo a relação entre distance e assignedValue
    for (let node of graph.nodes()) { delete node.distance; }
}