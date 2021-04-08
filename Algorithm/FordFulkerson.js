import {cloneTransformNodes} from "./Auxiliary/GraphTransformations.js";
import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {RequirementType} from "./Control/AlgorithmRequirements.js";
import {HighlightType} from "../Utilities/Highlights.js";


const pseudocode = [
`\
<span>Função responsável por achar um novo caminho da fonte até o destino</span>
<span>para passar mais fluxo.</span>
function achaCaminho(fonte, final) {
    <span>Inicializa a fila somente com a fonte</span>
    fila = [fonte]
    marca fonte como visitado
    
    while(fila.length > 0) {
        nóCorrente = primeiro da fila
    
        <span>Visita as arestas saindo do nóCorrente</span>    
        for(arestaCorrente saindo de nóCorrente)
        {
            nóDestino = nó destino da arestaCorrente
            
            <span>Caso nóDestino seja um nó novo, o marca como visitado e</span>
            <spano insere na fila</span>
            <span>Desconsidera nós com residual 0, já que não tem como passar mais</span>
            <span>fluxo por eles</span>
            if(nóDestino não foi visitado && nóDestino.residual > 0) {
                if(nóDestino === final) {
                    return caminho até nóDestino
                }
                
                marca nóDestino como visitado
                fila.insere(nóDestino)
            }
        }
    }
}


`,
`\
<span>Inicializando arestas com fluxo 0</span>
for(aresta de grafo) {
    aresta.fluxo = 0
    aresta.capacidade = aresta.peso
}
`,
`\
<span>Inicializando rede residual</span>
for(arestaCorrente de grafo) {
    aresta.fluxo = 0
    
    <span>O residual de uma aresta é quanto falta para ela chegar a sua</span>
    <span>capacidade, como o fluxo é inicializado como 0 o residual é</span>
    <span>inicialmente a capacidade.</span>
    arestaCorrente.residual = arestaCorrente.capacidade
    
    nóInicio = nó inicial da arestaCorrente
    nóDestino = nó final da arestaCorrente
`,
`\
    <span>Checa se existe uma aresta na direção contrária da arestaCorrente</span>
    if(!existe aresta entre nóDestino e nóInicio) {
        <span>Cria uma aresta temporária caso não haja aresta inversa</span>
        <span>Essa aresta tem fluxo total e portanto, residual 0</span>
        novaAresta = criaAresta(nóDestino, nóInicio)
        novaAresta.capacidade = arestaCorrente.capacidade
        novaAresta.flow = arestaCorrente.capacidade
        novaAresta.residual = 0
    }
`,
`\
}
`,
`\
<span>Procura um novo caminho no inicio de cada loop e quebra caso</span>
<span>não exista</span>
while(caminho = findPath(fonte, final)) {
`,
`\
    <span>O menor residual no caminho representa o máximo de fluxo</span>
    <span>que pode ser passado por esse caminho.</span>
    menorResidual = menor residual de caminho
    
    for(aresta em caminho) {
        arestaInversa = inverso de aresta
        
        <span>Propagando o fluxo pelo caminho</span>
        aresta.residual = aresta.residual - menorResidual
        aresta.fluxo = aresta.fluxo + menorResidual
        
        <span>Retirando o fluxo do caminho inverso</span>
        arestaInversa.residual = arestaInversa.residual + menorResidual
        arestaInversa.fluxo = arestaInversa.fluxo - menorResidual
    }
`,
`\
}
<span>Revertendo conversão para rede residual</span>
for(aresta em grafo) {
    if(aresta é temporária) {
        grafo.remove(aresta)
    }
    else {
        deleta aresta.residual 
    }
}
`,
`\
fluxoMáximo = 0
for(aresta inicdente no nó final) {
    fluxoMáximo = fluxoMáximo + aresta.fluxo
}
return fluxoMáximo
`
]

const pseudolabels = ['findPath', 'init', 'initResidual', 'residualEdge', '',
    'loopInit', 'propagate', 'revertResidual', 'end']


export default async function FordFulkerson(controller) {
    controller.graphView.structure = cloneTransformNodes(controller.graphView.structure, NodeAssignedValueMixin)

    let source
    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó fonte.",
        node => source = node)

    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó final.",
        sink => {
            executeFordFulkerson(controller, source, sink)
        })
    await controller.resolveRequirements()
}


function findPath(graph, source, sink) {
    let visitedMap = new Map()
    let parentMap = new Map()
    for(let node of graph.nodes()) {
        visitedMap.set(node, false)
    }

    let queue = [source]
    visitedMap.set(source, true)
    while (queue.length > 0) {
        let currentNode = queue.shift()

        for(let [edge, node] of graph.edgesFrom(currentNode)) {
            if(!visitedMap.get(node) && edge.residual > 0) {
                if(node === sink) {
                    let path = [sink]
                    let pathNode = currentNode
                    while (pathNode) {
                        path.push(pathNode)
                        pathNode = parentMap.get(pathNode)
                    }
                    return path.reverse()
                }

                visitedMap.set(node, true)
                parentMap.set(node, currentNode)
                queue.push(node)
            }
        }
    }
}


function executeFordFulkerson(controller, source, sink) {
    let graph = controller.graphView.structure
    controller.setPseudocode(pseudocode, pseudolabels)

    // Verificando nós de entrada e saída
    if(graph.edgesFrom(sink).next().value) {
        console.error("Final não pode ter nós saindo")
        controller.addStep(graph, "Nó final não pode ter nós saindo dele", null, true)
        return
    }
    if(graph.edgesTo(source).next().value) {
        console.error("Fonte não pode ter nós chegando")
        controller.addStep(graph, "Nó fonte não pode ter nós incidentes.", null, true)
        return
    }
    // Inicializando visualização
    for(let [edge,] of graph.uniqueEdges()) {
        edge.capacity = Number.parseFloat(edge.assignedValue)
        edge.assignedValue = `0/${edge.assignedValue}`
    }
    controller.addStep(graph, "Iniciando algoritmo", 'init')

    controller.addStep(graph, "Transformando grafo em rede residual, o peso das arestas passará a representar " +
        "a quantidade de fluxo restante para a aresta atingir sua capacidade máxima. Arestas temporárias serão" +
        " criadas entre nós onde não existem arestas de ida e volta.", 'init')
    // Inicializando rede residual
    for(let [edge , nodeA, nodeB] of graph.uniqueEdges()) {
        if(edge.tempEdge) {
            continue
        }

        // Inicialização de aresta
        edge.flow = 0
        edge.residual = edge.capacity
        edge.assignedValue = edge.residual.toString()

        edge.highlights.add(HighlightType.DARK_WITH_BLINK)
        controller.addStep(graph,
            `Inicializando aresta com valor residual igual a sua capacidade, ${edge.residual}.`,
            'initResidual')
        edge.highlights.remove(HighlightType.DARK_WITH_BLINK)

        // Inserção de aresta temporária residual
        if(!graph.checkEdgeBetween(nodeB, nodeA)) {
            let newEdge = controller.graphView.insertEdgeBetween(nodeB, nodeA, false)
            newEdge.capacity = edge.capacity
            newEdge.flow = edge.capacity
            newEdge.residual = 0
            newEdge.assignedValue = newEdge.residual.toString()
            newEdge.tempEdge = true

            newEdge.highlights.add(HighlightType.DARK_WITH_BLINK)
            controller.addStep(graph, "Criando aresta temporária de volta com valor residual 0.", "residualEdge")
            newEdge.highlights.remove(HighlightType.DARK_WITH_BLINK)
        }
    }

    let path
    // Usando BFS para encontrar novas paths
    while(path = findPath(graph, source, sink)) {
        let pathEdges = []
        let pathBackEdges = []

        // Destacando nós com residual
        for(let [edge,] of graph.uniqueEdges()) {
            if(edge.residual === 0) {
                edge.highlights.add(HighlightType.DISABLED)
            } else {
                edge.highlights.add(HighlightType.DARK_WITH_BLINK)
            }
        }

        controller.addStep(graph, "Usando BFS para tentar encontrar um caminho com alguma capacidade residual.", 'loopInit')

        // Retirando destaque
        for(let [edge,] of graph.uniqueEdges()) {
            if(edge.residual === 0) {
                edge.highlights.remove(HighlightType.DISABLED)
            } else {
                edge.highlights.remove(HighlightType.DARK_WITH_BLINK)
            }
        }

        // Encontrando arestas que fazem parte do caminho
        for(let i=0;i<path.length - 1;i++) {
            let edge = graph.getEdgeBetween(path[i], path[i+1])
            edge.highlights.add(HighlightType.COLORED_A)

            let backEdge = graph.getEdgeBetween(path[i+1], path[i])
            backEdge.highlights.add(HighlightType.DARK_WITH_BLINK)
            pathEdges.push(edge)
            pathBackEdges.push(backEdge)
        }
        controller.addStep(graph,
            `Caminho ${path.reduce((prev, n) => prev + ' -> ' + n.toString(), "")} encontrado.`, 'findPath')

        let lowestResidual = Math.min(...pathEdges.map(e => e.residual))
        for(let i=0;i<pathEdges.length;i++) {
            pathEdges[i].residual -= lowestResidual
            pathEdges[i].flow += lowestResidual
            pathEdges[i].assignedValue = pathEdges[i].residual.toString()

            pathBackEdges[i].residual += lowestResidual
            pathBackEdges[i].flow -= lowestResidual
            pathBackEdges[i].assignedValue = pathBackEdges[i].residual.toString()
        }
        controller.addStep(graph, `Empurrando o máximo de fluxo possível no caminho que é ${lowestResidual}. Esse fluxo \
        é a capacidade mínima entre as arestas no caminho. Empurrar o fluxo envolve diminuir o residual do caminho \
        de ida e incrementar o residual do caminho de volta pelo valor empurrado (${lowestResidual}).`, 'propagate')

        for(let i=0;i<path.length - 1;i++) {
            pathEdges[i].highlights.remove(HighlightType.COLORED_A)
            pathBackEdges[i].highlights.remove(HighlightType.DARK_WITH_BLINK)
        }
    }

    for(let [edge,,] of graph.uniqueEdges()) {
        if(edge.tempEdge) {
            graph.removeEdge(edge)
            continue
        }

        edge.assignedValue = `${edge.flow}/${edge.capacity}`
    }
    controller.addStep(graph,
        "Removendo arestas temporárias e convertendo o grafo residual de volta para a rede de fluxo.",
        'revertResidual')

    let maxFlow = 0
    for(let [edge,] of graph.edgesTo(sink)) {
        maxFlow += edge.flow
    }
    controller.addStep(graph, `Algoritmo terminado, o fluxo máximo é ${maxFlow}.`, 'end')
}