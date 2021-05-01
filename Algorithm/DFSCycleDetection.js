import {HighlightType} from "../Utilities/Highlights.js";
import Stack from "./Auxiliary/Stack.js";
import GraphDirectedMixin from "../Structure/Mixins/Graph/GraphDirectedMixin.js";
import {RequirementType} from "./Control/AlgorithmRequirements.js";
export default async function DFSCycleDetection(controller) {
    let initialNode = null

    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione um nó inicial.<br><i>Pular esse requisito implica na escolha de um nó" +
        " arbitrário</i>",
        node => initialNode = node,
        true)
    await controller.resolveRequirements()

    ExecuteDFSCycleDetection(controller, initialNode)
}


export function ExecuteDFSCycleDetection(controller,
                                  firstNode = null,
                                  record = true) {

    let graph = controller.graphView.structure

    if (!firstNode) {
        firstNode = graph.nodes().next().value
        if(!firstNode) return;
    }


    if (record) {
        controller.setPseudocode('../Algorithm/Pseudocodes/DFSCycleDetection.html')
    }

    const isDirected = graph.mixins.has(GraphDirectedMixin)

    let stack = new Stack()
    controller.showcasing = stack

    if (firstNode) {
        stack.push(firstNode)
    }

    /* Marcando todas as arestas como não visitadas */
    for (let [edge,,] of graph.edges()) {
        edge.highlights.add(HighlightType.DISABLED)
    }

    if(record) {
        controller.addStep(graph, `Selecionando o nó ${firstNode.toString()} como inicial e inicializando pilha.`, 'init')
    }

    let currentNode;
    mainLoop: while(stack.length > 0){
        // Retirando novo nó do topo da pilha
        currentNode = stack.pop()
        // Destacando nó como visitado
        currentNode.highlights.add(HighlightType.COLORED_BORDER2)
        // Removendo destaque de nós na stack
        currentNode.highlights.remove(HighlightType.DARKEN)
        currentNode.visited = true

        if(record) {
            controller.addStep(graph, `Verificando o nó ${currentNode.toString()}.`, 'loopStart')
        }

        // Procurando por nós não visitados
        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            // Nó não visitado
            if(!node.visited) {
                // Salvando nó atual para verificação posterior e marcando o nó descoberto para visitação
                node.ancestral = currentNode

                // Colocando nós na stack e adicionando highlight de nós na stack
                stack.push(currentNode)
                stack.push(node)
                currentNode.highlights.add(HighlightType.DARKEN)

                edge.highlights.remove(HighlightType.DISABLED)
                // edge.highlights.add(HighlightType.DARKEN)

                if(record) {
                    controller.addStep(graph, `O nó ${node.toString()} foi descoberto.`, 'nodeNotVisited')
                }
                // Desmarcando nó como ativo
                currentNode.highlights.remove(HighlightType.COLORED_BORDER2)

                // Prosseguindo para o nó descoberto
                continue mainLoop

            // Nó que forma um ciclo detectado
            // No caso de um grafo direcionado é um nó que aponta para outro nó que ainda está na pilha
            // No caso de um grafo não direcionado é um nó que aponta para outro já visitado
            } else if(currentNode.ancestral !== node && node.ancestral !== currentNode && (!isDirected || stack.isInStack(node))) {
                edge.highlights.remove(HighlightType.DISABLED)
                edge.highlights.add(HighlightType.DARKEN)
                currentNode.highlights.add(HighlightType.DARKEN)
                currentNode.highlights.add(HighlightType.COLORED_BORDER2)
                if(record) {
                    if(isDirected)
                    {
                        controller.addStep(graph, `Aresta direcionada para o nó ${node.toString()} que está na pilha encontrada.`, 'nodeVisited')
                    } else {
                        controller.addStep(graph, `Aresta que aponta para o nó ${node.toString()} já visitado encontrada.`, 'nodeVisited')
                    }
                }
                edge.highlights.remove(HighlightType.DARKEN)
                // edge.highlights.remove(HighlightType.COLORED_A)
                // edge.highlights.add(HighlightType.DARK_WITH_BLINK)
                edge.highlights.add(HighlightType.COLORED_A)
                node.highlights.add(HighlightType.COLORED_BORDER2)
                // Fazendo backtracking para detectar o ciclo
                let backtrackNode = currentNode
                let cycle = [backtrackNode]
                while(backtrackNode !== node) {
                    let edge = graph.getEdgeBetween(backtrackNode.ancestral, backtrackNode)
                    edge.highlights.add(HighlightType.COLORED_A)
                    backtrackNode.highlights.add(HighlightType.COLORED_BORDER2)
                    backtrackNode = backtrackNode.ancestral
                    cycle.push(backtrackNode)

                    if(backtrackNode === null) {
                        console.error("Ancestrais mapeados incorretamente")
                        break mainLoop
                    }
                }
                // currentNode.highlights.remove(HighlightType.COLORED_BORDER2)
                if(record) {
                    controller.addStep(graph, 'Ciclo encontrado. Algoritmo finalizado.', 'nodeNotVisited')
                }

                // Retornando o ciclo revertido já que foi descoberto por backtracking
                return cycle.reverse()
            }
        }
        // Caso nenhum nó tenha sido encontrado, mandar mensagem de nenhum nó encontrado
        if(record) {
            controller.addStep(graph, `Verificando o nó ${currentNode.toString()}, nenhum nó novo encontrado.`)
        }
        currentNode.highlights.remove(HighlightType.COLORED_BORDER2)
    }
    if(record) {
        controller.addStep(graph, "Nenhum loop encontrado. Algoritmo finalizado.", 'noCycle')
    }
}