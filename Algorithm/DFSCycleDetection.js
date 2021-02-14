import {HighlightType} from "../Structure/Highlights.js";

function toggleNodeActive(node) {
    if(node.highlights.has(HighlightType.DARK_WITH_BLINK))
    {
        node.highlights.remove(HighlightType.DARK_WITH_BLINK)
    } else {
        node.highlights.add(HighlightType.DARK_WITH_BLINK)
    }
}

function markEdgeAsVisited(edge) {
    edge.highlights.add(HighlightType.DARKEN)
}


export default function DFSCycleDetection(controller) {
    let graph = controller.graphView.structure
    let stack = [graph.nodes().next().value]

    /* Marcando todas as arestas como não visitadas */
    for(let [edge,,] of graph.edges()) {
        edge.highlights.add(HighlightType.ALGORITHM_NOTVISITED)
    }


    let currentNode
    mainLoop: while(stack.length > 0){
        // Retirando novo nó do topo da pilha
        currentNode = stack.pop()
        currentNode.visited = true
        toggleNodeActive(currentNode)

        // Procurando por nós não visitados
        for(let [edge, node] of graph.edgesFrom(currentNode))
        {
            if(!node.visited)
            {
                // Se achou pelo menos um nó novo mandar mensagem de verificação
                controller.addStep(graph, `Verificando o nó ${currentNode.label}.`)

                // Salvando nó atual para verificação posterior e marcando o nó descoberto para visitação
                node.ancestral = currentNode
                stack.push(currentNode)
                stack.push(node)
                markEdgeAsVisited(edge)

                controller.addStep(graph, `O nó ${node.label} foi descoberto.`)
                toggleNodeActive(currentNode)

                // Prosseguindo para o nó descoberto
                continue mainLoop
            } else if(currentNode.ancestral !== node && node.ancestral !== currentNode) {
                edge.highlights.add(HighlightType.COLORED_BORDER)
                controller.addStep(graph, `Aresta direcionada para o nó ${node.label} já visitado encontrada.`)
                edge.highlights.remove(HighlightType.COLORED_BORDER)
                edge.highlights.add(HighlightType.DARK_WITH_BLINK)

                let backtrackNode = currentNode
                while(backtrackNode !== node) {
                    let edge = graph.getEdgeBetween(backtrackNode, backtrackNode.ancestral)
                    edge.highlights.add(HighlightType.DARK_WITH_BLINK)
                    backtrackNode = backtrackNode.ancestral

                    if(backtrackNode === null) {
                        console.error("Ancestrais mapeados incorretamente")
                        break mainLoop
                    }
                }
                controller.addStep(graph, 'Loop encontrado. Algoritmo finalizado.')
                return
            }
        }
        // Caso nenhum nó tenha sido encontrado, mandar mensagem de nenhum nó encontrado
        controller.addStep(graph, `Verificando o nó ${currentNode.label}, nenhum nó novo encontrado.`)
        toggleNodeActive(currentNode)
    }
    controller.addStep(graph, "Nenhum loop encontrado. Algoritmo finalizado.")
}