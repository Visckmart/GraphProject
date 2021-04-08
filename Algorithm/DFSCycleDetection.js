import {HighlightType} from "../Utilities/Highlights.js";
import Stack from "./Auxiliary/Stack.js";
import GraphDirectedMixin from "../Structure/Mixins/Graph/GraphDirectedMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {RequirementType} from "./Control/AlgorithmRequirements.js";

const pseudoCode = [
`\
<span>Escolhendo um nó arbitrário para iniciar o algoritmo caso um nó</span>
<span>não tenha sido escolhido</span>
primeiroNó = nó escolhido || nó arbitrário

<span>Inicializando pilha e inserindo nó corrente</span>
pilha = Pilha()
pilha.push(primeiroNó)
`,
`\
while(pilha.size > 0) {
     nóCorrente = pilha.pop()
     nóCorrente.visitado = true
    for aresta, nóDestino in arestasSaindoDe(nóCorrente) {
`,
`\
        if(!nóDestino.visitado) {
            <span>Salvando nó corrente na pilha para visitação futura</span>
            pilha.push(nóCorrente)
            
            nóDestino.ancestral = nóCorrente
            <span>Colocando novo nó descoberto no topo da pilha</span>
            pilha.push(nóDestino)
            
            continua para proxima visualização
        }
`,
`\
        <span>Se o nó destino não foi visitado e seu ancestral é diferente do nó atual</span>
        else if(nóCorrente.ancestral != nóDestino.ancestral) {
            <span>Caso o grafo seja direcionado o nó destino também precisa estar na pilha</span>
            if(grafo não é direcionado || pilha.estáNaPilha(nóDestino)) {
                ciclo = navegar por ancestrais de nóCorrente até chegar em nóDestino
                return ciclo
            }
        }
`,
`
    }
    return ciclo não encontrado
}
`
]

const pseudoLabels = ['init', 'loopStart', 'nodeNotVisited', 'nodeVisited', 'noCycle']

export default async function DFSCycleDetection(controller) {
    let initialNode = null

    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione um nó de inicio. (Pular esse requisito implica na escolha de um nó arbitrário)",
        node => initialNode = node,
        true)
    await controller.resolveRequirements()

    ExecuteDFSCycleDetection(controller, initialNode)
}


export function ExecuteDFSCycleDetection(controller,
                                  firstNode = null,
                                  record = true) {

    let graph = controller.graphView.structure

    if(!firstNode) {
        firstNode = graph.nodes().next().value

        if(!firstNode) return
    }


    if(record) {
        controller.setPseudocode(pseudoCode, pseudoLabels)
    }

    const isDirected = graph.mixins.has(GraphDirectedMixin)

    let stack = new Stack()
    controller.showcasing = stack

    if(firstNode) {
        stack.push(firstNode)
    }

    /* Marcando todas as arestas como não visitadas */
    for(let [edge,,] of graph.edges()) {
        edge.highlights.add(HighlightType.DISABLED)
    }

    if(record) {
        controller.addStep(graph, `Selecionando o nó ${firstNode.toString()} como inicial e inicializando pilha.`, 'init')
    }

    let currentNode
    mainLoop: while(stack.length > 0){
        // Retirando novo nó do topo da pilha
        currentNode = stack.pop()
        // Destacando nó como visitado
        currentNode.highlights.add(HighlightType.DARK_WITH_BLINK)
        // Removendo destaque de nós na stack
        currentNode.highlights.remove(HighlightType.LIGHTEN)
        currentNode.visited = true

        if(record) {
            controller.addStep(graph, `Verificando o nó ${currentNode.toString()}.`, 'loopStart')
        }

        // Procurando por nós não visitados
        for(let [edge, node] of graph.edgesFrom(currentNode))
        {
            // Nó não visitado
            if(!node.visited)
            {
                // Salvando nó atual para verificação posterior e marcando o nó descoberto para visitação
                node.ancestral = currentNode

                // Colocando nós na stack e adicionando highlight de nós na stack
                stack.push(currentNode)
                stack.push(node)
                currentNode.highlights.add(HighlightType.LIGHTEN)
                currentNode.highlights.add(HighlightType.LIGHTEN)

                edge.highlights.add(HighlightType.DARKEN)

                if(record) {
                    controller.addStep(graph, `O nó ${node.toString()} foi descoberto.`, 'nodeNotVisited')
                }
                // Desmarcando nó como ativo
                currentNode.highlights.remove(HighlightType.DARK_WITH_BLINK)

                // Prosseguindo para o nó descoberto
                continue mainLoop

            // Nó que forma um ciclo detectado
            // No caso de um grafo direcionado é um nó que aponta para outro nó que ainda está na pilha
            // No caso de um grafo não direcionado é um nó que aponta para outro já visitado
            } else if(currentNode.ancestral !== node && node.ancestral !== currentNode && (!isDirected || stack.isInStack(node))) {
                edge.highlights.add(HighlightType.COLORED_A)
                if(record) {
                    if(isDirected)
                    {
                        controller.addStep(graph, `Aresta direcionada para o nó ${node.toString()} que está na pilha encontrada.`, 'nodeVisited')
                    } else {
                        controller.addStep(graph, `Aresta que aponta para o nó ${node.toString()} já visitado encontrada.`, 'nodeVisited')
                    }
                }
                edge.highlights.remove(HighlightType.COLORED_A)
                edge.highlights.add(HighlightType.DARK_WITH_BLINK)

                // Fazendo backtracking para detectar o ciclo
                let backtrackNode = currentNode
                let cycle = [backtrackNode]
                while(backtrackNode !== node) {
                    let edge = graph.getEdgeBetween(backtrackNode.ancestral, backtrackNode)
                    edge.highlights.add(HighlightType.DARK_WITH_BLINK)
                    backtrackNode = backtrackNode.ancestral
                    cycle.push(backtrackNode)

                    if(backtrackNode === null) {
                        console.error("Ancestrais mapeados incorretamente")
                        break mainLoop
                    }
                }
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
        currentNode.highlights.remove(HighlightType.DARK_WITH_BLINK)
    }
    if(record) {
        controller.addStep(graph, "Nenhum loop encontrado. Algoritmo finalizado.", 'noCycle')
    }
}