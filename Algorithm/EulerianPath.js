import { HighlightType } from "../Structure/Highlights.js"
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";
import Edge from "../Structure/Edge.js";
import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import {MinHeap} from "./Auxiliary/Heap.js";

function markAsActive(artifact) {
    artifact.highlights.add(HighlightType.COLORED_BORDER2)
}
function markAsNotActive(artifact) {
    artifact.highlights.remove(HighlightType.COLORED_BORDER2)
}

function markAsNotVisited(artifact) {
    artifact.highlights.add(HighlightType.DISABLED)
}
function markAsVisited(artifact) {
    if (artifact instanceof Edge) {
        artifact.highlights.remove(HighlightType.ALGORITHM_VISITING)
        artifact.highlights.add(HighlightType.DARKEN)
        return;
    }
    artifact.highlights.add(HighlightType.LIGHTEN)
}

function markAsVisiting(artifact) {
    artifact.highlights.add(HighlightType.ALGORITHM_VISITING)
}

export default async function EulerianPath(controller) {
    let initialNode
    /* Esse algoritmo usa nós com assignedValue para visualização */
    controller.graphView.structure = cloneTransformNodes(controller.graphView.structure, NodeAssignedValueMixin)

    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó de inicio.",
        node => {
            executeEulerianPath(controller, node)
        })
    await controller.resolveRequirements()
}

function getConnectedComponent(graph, startNode) {
    let queue = [startNode];

    let auxExplored = new Set();
    while (queue.length > 0) {
        let t = queue.shift();
        auxExplored.add(t)

        for (let [, node] of Array.from(graph.edgesFrom(t))) {
            if (auxExplored.has(node)) continue;
            auxExplored.add(node);
            queue.push(node);
        }
    }
    return auxExplored;
}

function checkNodeDegrees(controller, graph) {
    let oddCount = 0;
    for (let node of graph.nodes()) {
        let count = 0
        for (let neighbour of graph.edgesFrom(node)) count += 1;
        if (count % 2 != 0) {
            markAsActive(node)
            oddCount += 1;
            controller.addStep(graph,
                               `<strong>O nó ${node.label} tem um número ímpar de vizinhos (${count}).</strong><br>
                               Total de nós com grau ímpar: ${oddCount}`)
        }
    }
    return oddCount;
}

function executeEulerianPath(controller, initialNode, finalNode) {
    let graph = controller.graphView.structure;

    let allNodes = Array.from(graph.nodes())

    let connectedCompNodes = getConnectedComponent(graph, initialNode)
    let disconnectedNodes = allNodes.filter(node => !connectedCompNodes.has(node))
    console.log("Disconnected", disconnectedNodes.map(n => n.label))

    let wrongNode;
    if (disconnectedNodes.length > 0) {
        for (let node of disconnectedNodes) {
            if (graph.edgesFrom(node).next().done == false) {
                wrongNode = node;
                break;
            }
        }
    }

    if (disconnectedNodes.length > 0 && wrongNode) {
        markAsActive(wrongNode)
        markAsActive(initialNode)
        controller.addStep(graph,
                           `${wrongNode.label} é um nó que não pertence à \
                           mesma componente conexa que ${initialNode.label}, e tem \
                           grau (número de vizinhos) maior que 0.
                           <strong>Portanto não há um caminho euleriano no grafo.</strong>`)
        return;
    }
    let oddCount = checkNodeDegrees(controller, graph)

    for (let node of graph.nodes()) markAsNotActive(node)
    if (oddCount != 0 && oddCount != 2) {
        controller.addStep(graph,
                           `O grafo contém ${oddCount} nós com grau \
                           (número de vizinhos) ímpar, portanto o grafo NÃO \
                           tem um trajeto euleriano.`)
        return;
    }

    let start;
    if (oddCount == 0) {
        start = `O grafo não contém nós com grau (número de vizinhos) ímpar.\n`
    } else if (oddCount == 2) {
        start = `O grafo contém 2 nós com grau (número de vizinhos) ímpar.\n`
    }
    controller.addStep(graph, start +
                       `Além disso, contém mais de uma componente conexa, \
                       mas só uma delas contém nós com grau maior que \
                       0, <strong>portanto há um caminho euleriano.</strong>`)
    let allEdges = new Set(Array.from(graph.edges()))
    let queue = [initialNode]
    let path = []
    while (queue.length > 0) {
        let currentNode = queue.pop()
        path.push(currentNode)
        console.log(currentNode.label, initialNode.label)
        if (path.length > 2 && currentNode == initialNode) {
            break;
        }
        for (let [edge, node] of graph.edgesFrom(currentNode)) {
            if (node == currentNode) continue;
            if (allEdges.has(edge)) {
                allEdges.delete(edge)
                console.log(currentNode)
                console.log(node)
                queue.push(node)
            }
        }
    }
    console.log(path.map(n => n.label))
    controller.addStep(graph, path.map(n => n.label))
    // /* 1. create vertex set Q */
    // /* Inicializando heap secundário */
    // let heap = new MinHeap()
    // controller.showcasing = heap
    //
    // // Preparando visualmente as arestas
    // for (let [edge, , ] of graph.uniqueEdges()) {
    //     markAsNotVisited(edge)
    // }
    //
    // /*
    // 2.
    // for each vertex v in Graph:
    //     dist[v] ← INFINITY
    //     prev[v] ← UNDEFINED
    //     add v to Q
    // dist[source] ← 0
    // */
    //
    // // Preparando nó inicial
    // initialNode.distance = 0
    // initialNode.previous = {edge: null, node: null}
    //
    // // Preparando os outros nós
    // for (let node of graph.nodes()) {
    //     if (node !== initialNode) {
    //         node.distance = Infinity
    //         node.previous = {edge: null, node: null}
    //     }
    //     heap.insert(node, node.distance);
    // }
    // controller.addStep(graph,
    //                    `Testando`)
    //
    //
    // /*
    // 3.
    // while Q is not empty:
    //     u ← vertex in Q with min dist[u]
    //     remove u from Q
    //     ...
    //  */
    // let currentNode = null;
    // while (currentNode !== finalNode) {
    //     currentNode = heap.remove();
    //     if (!currentNode || currentNode.distance === Infinity) { break; }
    //
    //     markAsVisited(currentNode)
    //     markAsActive(currentNode)
    //
    //
    //     // Checa se o nó tem vizinhos além do que alcançou ele
    //     let hasInterestingNeighbours = false;
    //     for (let [neighbourEdge, ] of graph.edgesFrom(currentNode)) {
    //         if (neighbourEdge === currentNode.previous.edge) { continue; }
    //         hasInterestingNeighbours = true;
    //         break;
    //     }
    //     if (hasInterestingNeighbours) {
    //         controller.addStep(graph,
    //                            `Começando a visitação do nó ${currentNode.label}.`)
    //     } else {
    //         controller.addStep(graph,
    //                            `Começando a visitação do nó ${currentNode.label}. \
    //                            Como o nó ${currentNode.label} não tem mais \
    //                            vizinhos, não há mais nada a fazer.`)
    //     }
    //
    //     /*
    //     4.
    //     for each neighbor v of u:           // only v that are still in Q
    //         alt ← dist[u] + length(u, v)
    //         if alt < dist[v]:
    //             dist[v] ← alt
    //             prev[v] ← u
    //      */
    //     // Passa por todos os nós conectados ao atual
    //     for (let [edge, node] of graph.edgesFrom(currentNode)) {
    //         // Ignora o nó anterior
    //         if(node === currentNode.previous.node) { continue; }
    //
    //         markAsVisited(node)
    //         markAsVisiting(edge)
    //
    //         let edgeValue = Number.parseFloat(edge?.assignedValue ?? 1)
    //         let newDistance = currentNode.distance + edgeValue;
    //         // Se a distância atual é menor que a registrada
    //         if (newDistance < node.distance) {
    //             let oldDistanceStr = node.distance === Infinity ? '∞' : node.distance
    //
    //             node.distance = newDistance
    //             node.previous = {edge: edge, node: currentNode}
    //
    //             // Atualizando peso
    //             heap.changeValue(node, node.distance)
    //
    //             controller.addStep(graph,
    //                                `Analisando a distância do nó \
    //                                ${currentNode.label} até ${node.label}.
    //                                Atualizando sua distância para ${newDistance}, \
    //                                que é menor que a distância atual \
    //                                (${oldDistanceStr}), e salvando a aresta \
    //                                destacada como a aresta anterior no caminho \
    //                                até ${node.label}.`)
    //
    //         // Se a distância atual NÃO é menor que a registrada
    //         } else {
    //             controller.addStep(graph,
    //                                `Analisando a distância do nó \
    //                                ${currentNode.label} até ${node.label}.
    //                                Sua distância (${node.distance}) não é maior \
    //                                que a nova distância (${newDistance}) e \
    //                                portanto não será atualizada.`)
    //         }
    //         markAsVisited(edge)
    //     }
    //
    //     markAsNotActive(currentNode)
    //     markAsVisited(currentNode)
    //     if (currentNode === initialNode) {
    //         // initialNode.highlights.add(HighlightType.DARK_WITH_BLINK)
    //         // initialNode.highlights.add(HighlightType.DARKEN)
    //     }
    // }
    //
    // // finalNode.highlights.add(HighlightType.DARK_WITH_BLINK);
    // // finalNode.highlights.add(HighlightType.DARKEN)
    // let textoPassoFinal;
    // if(currentNode === finalNode) {
    //     textoPassoFinal = 'Nó final foi visitado portanto as visitações estão ' +
    //                       'concluídas.\nCaminhando pelas distâncias mais curtas ' +
    //                       'para encontrar o menor caminho.'
    //
    //     // Caminhe pelos nós e pelas arestas anteriores, destacando-os
    //     currentNode = finalNode
    //     while(currentNode !== null) {
    //         currentNode.highlights.add(HighlightType.COLORED_A)
    //         // currentNode.highlights.remove(HighlightType.DARKEN)
    //         currentNode.previous.edge?.highlights.add(HighlightType.COLORED_A)
    //         currentNode = currentNode.previous.node
    //     }
    // } else {
    //     textoPassoFinal = 'Não sobrou nenhum nó alcançável com distância ' +
    //                       'menor que ∞, portanto a visitação foi concluída.'
    // }
    // controller.addStep(graph, textoPassoFinal + ' Algoritmo concluído.')
    //
    // // Removendo a relação entre distance e assignedValue
    // for (let node of graph.nodes()) { delete node.distance; }
}