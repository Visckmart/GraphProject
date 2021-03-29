import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import {HighlightType} from "../Structure/Highlights.js";
import {MinHeap} from "./Auxiliary/Heap.js";

function markArtifactAsUnreached(artifact) {
    artifact.highlights.add(HighlightType.DISABLED)
}

function markArtifactAsReached(artifact) {
    artifact.highlights.remove(HighlightType.DISABLED)
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


const pseudocode = [
`\
<span>Inicializando nós com distância ∞ e sem aresta anterior</span>
for(nó em grafo) {
    nó.distancia = ∞
    nó.anterior = null
}

<span>Colocando nó arbitrário como inicial</span>
nóArbitrário = nó qualquer do grafo
nóArbitrário.distancia = 0

<span>Inicializando heap mínimo, os nós serão pesados</span>
<span>por suas distâncias</span>
heap = MinHeap()

for(nó em grafo) {
    heap.insere(nó)
}
`,
`\
while(true) {
    <span>Removendo nó no topo do heap que é o nó com menor distância</span>
    nóCorrente = heap.remove()
    
    <span>Quebra o loop se não há mais nós no heap ou se o menor nó</span>
    <span>tem distância ∞</span>
    if(nóCorrente == null || nóCorrente.distancia = ∞) {
        break
    }
    
    nóCorrente.incluso = true
`,
`\
    for(arestaCorrente saindo de nóCorrente) {
        nóDestino = nó destino de ArestaCorrente
        
        <span>Se a arestaCorrente é a aresta pelo qual chegamos em nóCorrente ou</span>
        <span>se o nóCorrente já foi incluso, ignore arestaCorrente</span>
        if(arestaCorrente === nóCorrente.anterior || nóDestino.incluso == true)
        {
            continue
        }
        
        novaDistância = arestaCorrente.distancia
`,
`\
        <span>Se a nova distância é menor do que a distância atual do nó</span>
        <span>atualiza sua distância e aresta anterior.</span>
        if(novaDistância < nóDestino.distancia) {
            nóDestino.distancia = novaDistância
            nóDestino.anterior = arestaCorrente
            
            heap.mudaPeso(nóDestino, novaDistância)
        }
`,
`\
        else {
            ignora arestaCorrente
        }
`,
`\
    }
}
`,
`\
<span>Uma árvore não foi encontrada pois um nó não foi alcançado</span>
if(algum nó ainda tem distância ∞)
{
    return null
}
`,
`\
else {
    return árvore encontrada
}
`
]

const pseudoLabels = ['init', 'initLoop', 'inspectEdge', 'update', 'noUpdate', '', 'notFount', 'found']


export default function PrimMST(controller) {
    /* Esse algoritmo usa nós com assignedValue para visualização */
    controller.graphView.structure = cloneTransformNodes(controller.graphView.structure, NodeAssignedValueMixin)
    controller.setPseudocode(pseudocode, pseudoLabels)

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

    controller.addStep(graph,
        'Marcando todos os nós do grafo com distância ∞ e sem aresta anterior',
        'init')

    node.distance = 0
    node.assignedValue = '0'
    controller.addStep(graph,
        'Marcando um nó arbitrário como nó inicial e colocando sua distância como 0')

    /* Inicializando estrutura de heap auxiliar */
    let heap = new MinHeap()
    controller.showcasing = heap

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

        currentNode.included = true
        currentNode.assignedValue = ''
        controller.addStep(graph,  `Incluindo o nó ${currentNode.label}`, 'initLoop')

        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            if(edge === currentNode.previousEdge || node.included)
            {
                continue
            }
            toggleArtifactExploring(edge)
            toggleArtifactExploring(node)

            let newDistance = Number.parseFloat(edge.assignedValue)

            controller.addStep(graph, `Inspecionando a aresta de peso ${newDistance}`, 'inspectEdge')
            if(Number.isNaN(newDistance)) {
                throw  new Error("Peso inválido na aresta")
            }
            if(newDistance < node.distance) {
                node.assignedValue = newDistance.toString()
                node.previousEdge = edge

                controller.addStep(graph,
                    `A distância atual ${node.distance === Infinity ? '∞':node.distance} é maior que a\
                     distância ${newDistance} potencial e portanto será atualizada para ${newDistance}.`,
                    'update')
                node.distance = newDistance

                // Atualizando valor no heap
                heap.changeValue(node, node.distance)
            } else {
                controller.addStep(graph,
                    `A distância atual ${node.distance} já é menor que a nova distância\
                     ${newDistance} e portanto será mantida.`,
                    'noUpdate')
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
        for(let [edge,,] of graph.edges()) {
            if(!edge.highlights.has(HighlightType.DISABLED)) {
                edge.highlights.add(HighlightType.DARK_WITH_BLINK)
            }
        }

        controller.addStep(graph, 'Árvore geradora mínima encontrada!', 'found')
    } else {
        controller.addStep(graph,
            'O grafo não é conexo portanto não há árvore geradora mínima.',
            'notFound')
    }
}