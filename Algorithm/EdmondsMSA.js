import {cloneTransformNodes, mapNewNodesOrEdges} from "./Auxiliary/GraphTransformations.js";
import NodeAssignedValueMixin from "../Structure/Mixins/Node/NodeAssignedValueMixin.js";
import {RequirementType} from "../Drawing/AlgorithmControls/AlgorithmRequirements.js";
import {HighlightType} from "../Structure/Highlights.js";
import {ExecuteDFSCycleDetection} from "./DFSCycleDetection.js";

export default async function EdmondsMSA(controller) {
    // Capturando nó inicial
    controller.addRequirement(RequirementType.SELECT_NODE,
        "Selecione o nó de inicio.",
        node => executeEdmondsMSA(controller, node))
    await controller.resolveRequirements()
}

function executeEdmondsMSA(controller, initialNode) {
    let graph = controller.graphView.structure

    initialNode.highlights.add(HighlightType.DARKEN)
    controller.addStep(graph, `Marcando o nó inicial como raiz.`)

    // Mostrando arestas direcionadas a raiz
    for(let [edge,] of graph.edgesTo(initialNode)) {
        edge.highlights.add(HighlightType.FEATURE_PREVIEW)
        edge.excluded = true
    }
    controller.addStep(graph, 'Removendo todas as arestas direcionadas para o nó raiz.')
    // Marcando arestas direcionadas para raiz como excluídas
    for(let [edge,] of graph.edgesTo(initialNode)) {
        graph.removeEdge(edge)
    }

    let smallest = new Map()
    for(let node of graph.nodes()) {
        if(node === initialNode) {
            continue
        }

        let edgesToNode = Array.from(graph.edgesTo(node))

        if(edgesToNode.length > 0)
        {
            let smallestWeight = Math.min(...edgesToNode.map(e => e[0].assignedValue))
            let [smallestEdge, smallestNode] = edgesToNode.find(e => e[0].assignedValue == smallestWeight)
            // Guardando nó como fonte
            node.source = smallestEdge
            node.sourceNode = smallestNode
            smallestEdge.highlights.add(HighlightType.DARK_WITH_BLINK)

            controller.addStep(graph, `Marcando menor aresta direcionada para o nó ${node.toString()} como sua fonte.`)

            smallest.set(node, [smallestEdge, smallestNode])
        }

    }
    // Removendo highlights
    smallest.forEach(e => e[1].highlights.remove(HighlightType.DARK_WITH_BLINK))

    controller.addStep(graph, `Chamando a detecção de ciclo DFS incluindo \
                               somente as arestas marcadas para determinar se há algum ciclo nelas.`)
    let DFSGraph = graph.clone()

    // Limpando highlights
    for(let node of DFSGraph.nodes()) {
        node.highlights.clear()
    }

    for(let [edge,,] of DFSGraph.uniqueEdges()) {
        edge.highlights.clear()
    }

    // Removendo nós que não são os marcados
    let completeDFStoOldMap = mapNewNodesOrEdges(graph.nodes(), DFSGraph.nodes())
    for(let [edge, nodeA, nodeB] of DFSGraph.uniqueEdges()) {
        let oldNodeA = completeDFStoOldMap.get(nodeA)
        let oldNodeB = completeDFStoOldMap.get(nodeB)
        if(oldNodeB.sourceNode !== oldNodeA) {
            DFSGraph.removeEdge(edge)
        }
    }

    // TODO: Gambiarra enorme, favor não ler
    let cycle
    for(let node of graph.nodes()) {
        controller.graphView.structure = DFSGraph.clone()
        // Achando nó no grafo clonado
        let newNode = mapNewNodesOrEdges([node], controller.graphView.structure.nodes(), false).get(node)

        newNode.highlights.add(HighlightType.COLORED_A)
        controller.addStep(controller.graphView.structure, `Chamando a detecção de ciclo DFS no nó ${node.toString()}.`)

        let foundCycle = ExecuteDFSCycleDetection(controller, newNode, false)
        //TODO: Pensar em como incluir o showcase
        controller.showcasing = null
        controller.graphView.structure = graph

        if(foundCycle) {
            controller.addStep(controller.graphView.structure, `Ciclo encontrado no nó ${node.toString()}.`)
            cycle = foundCycle
            break
        }
    }

    if(!cycle) {
        controller.addStep(graph, 'Nenhum ciclo encontrado portanto as arestas marcadas formam uma estrutura de árvore mínima.')
        return smallest
    }

    // Mapeando nós do ciclo para nós antigos
    let cycleNodeMap = mapNewNodesOrEdges(graph.nodes(), cycle)
    // Modificando ciclo para incluir nós antigos
    cycle = cycle.map(node => cycleNodeMap.get(node))

    let reducedGraph = graph.clone()
    controller.graphView.structure = reducedGraph

    // Mapeando os nós do grafo antigo para o novo
    let oldToReducedGraphMap = mapNewNodesOrEdges(graph.nodes(), reducedGraph.nodes(), false)
    let reducedToOldGraphMap = mapNewNodesOrEdges(graph.nodes(), reducedGraph.nodes())

    // Marcando nós do ciclo
    for(let node of cycleNodeMap.values()) {
        oldToReducedGraphMap.get(node).highlights.add(HighlightType.COLORED_A)
    }
    controller.addStep(reducedGraph, 'Reduzindo o ciclo encontrado para um nó')

    let averageX = cycle.reduce((sum, n2) => sum + n2.pos.x, 0)/cycle.length
    let averageY = cycle.reduce((sum, n2) => sum + n2.pos.y, 0)/cycle.length

    let reducedNode = controller.graphView.insertNewNodeAt({x: averageX, y:averageY})
    reducedNode.label = 'V𝒸'
    controller.addStep(reducedGraph, `Criando novo nó ${reducedNode.toString()} que representará o ciclo reduzido`)


    // Estrutura auxiliar para saber que nós pertencem ao ciclo
    let cycleSet = new Set(cycle)
    // Analisando todos os nós do ciclo para reduzi-los
    for(let oldNode of cycle) {
        let newNode = oldToReducedGraphMap.get(oldNode)
        newNode.highlights.add(HighlightType.DARKEN)
        controller.addStep(reducedGraph, `Analisando a aresta ${newNode.toString()} do ciclo.`)
        // Analisando nós chegando no ciclo
        for(let [edge, oldSourceNode] of graph.edgesTo(oldNode)) {
            // Nó faz parte do ciclo
            if(cycleSet.has(oldSourceNode)) {
                continue
            }


            let newEdge =  controller.graphView.insertEdgeBetween(oldToReducedGraphMap.get(oldSourceNode), reducedNode)

            newEdge.assignedValue = edge.assignedValue - oldNode.source.assignedValue
            newEdge.highlights.add(HighlightType.COLORED_A)
            edge.highlights.add(HighlightType.FEATURE_PREVIEW)

            // Guardando equivalência com nó antigo
            newEdge.oldDestination = oldNode
            newEdge.oldSource = oldSourceNode
            newEdge.oldEdge = edge

            controller.addStep(reducedGraph, `Analisando a aresta que sai do nó ${oldSourceNode.toString()} para o nó\
            ${oldNode.toString()}, parte do ciclo. Uma nova aresta será criada do nó ${oldSourceNode.toString()} até\
            o nó reduzido com peso igual ao peso dessa aresta (${edge.assignedValue}) menos o peso da fonte do nó\
             ${oldNode.toString()} (${oldNode.source.assignedValue}), \
            ${newEdge.assignedValue}.`)

            newEdge.highlights.remove(HighlightType.COLORED_A)
            edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
        }

        // Analisando nós saindo do ciclo
        for(let [edge, oldDestinationNode] of graph.edgesFrom(oldNode)) {
            // Nó já faz parte do ciclo
            if(cycleSet.has(oldDestinationNode)) {
                continue
            }


            let newEdge = controller.graphView.insertEdgeBetween(reducedNode, oldToReducedGraphMap.get(oldDestinationNode))
            if(!newEdge) {
                console.error('Aresta não pode ser inserida')
                return
            }
            newEdge.assignedValue = edge.assignedValue
            newEdge.highlights.add(HighlightType.COLORED_A)
            edge.highlights.add(HighlightType.FEATURE_PREVIEW)

            // Guardando equivalência com nó antigo
            newEdge.oldDestination = oldDestinationNode
            newEdge.oldSource = oldNode
            newEdge.oldEdge = edge

            controller.addStep(reducedGraph, `Analisando a aresta que sai do nó ${oldNode.toString()} para o nó \
            ${oldDestinationNode.toString()}. Uma nova aresta será criada no nó reduzido até o antigo destino, o\
            nó ${oldDestinationNode.toString()}. Seu peso será igual a aresta anterior, ${newEdge.assignedValue}.`)
        }

        reducedGraph.removeNode(oldToReducedGraphMap.get(oldNode))
        controller.addStep(reducedGraph, `Finalizando a analise do nó ${oldNode.toString()} e removendo-o.`)
    }

    controller.addStep(reducedGraph, 'Chamada recursiva do algoritmo no grafo com o ciclo reduzido.')
    // Chamada recursiva
    let childArborescense = executeEdmondsMSA(controller, initialNode)
    controller.graphView.structure = graph

    // Resgatando aresta remanescente no nó reduzido
    let [reducedRemainingEdge, ] = childArborescense.get(reducedNode) || [null, null]
    if(!reducedRemainingEdge) {
        console.error("Nenhuma aresta remanscente")
        return new Map()
    }

    reducedRemainingEdge.highlights.add(HighlightType.COLORED_A)
    controller.addStep(reducedGraph, 'A aresta destacada é o último remanescente para o nó reduzido.')

    let correspondingEdge = reducedRemainingEdge.oldEdge
    correspondingEdge.highlights.add(HighlightType.COLORED_A)

    let correspondingDestinationNode = reducedRemainingEdge.oldDestination

    let markedEdge = correspondingDestinationNode.source
    markedEdge.highlights.add(HighlightType.FEATURE_PREVIEW)

    controller.addStep(graph, `O equivalente da aresta da etapa anterior é a destacada e leva para o nó equivalente\
    ${correspondingDestinationNode}. Removendo a aresta que anteriormente era fonte do nó \
    ${correspondingDestinationNode}, quebrando o ciclo.`)

    graph.removeEdge(markedEdge)
    correspondingEdge.highlights.remove(HighlightType.COLORED_A)

    controller.graphView.structure = graph

    for(let [edge,,] of graph.uniqueEdges()) {
        edge.highlights.add(HighlightType.DISABLED)
    }

    let arborescense = new Map()
    // Marcando arestas do antigo ciclo
    for(let node of cycle) {
        if(node === correspondingDestinationNode) {
            continue
        }
        node.source.highlights.add(HighlightType.DARK_WITH_BLINK)
        node.source.marked = true

        arborescense.set(node, [node.source, node.sourceNode])
    }
    controller.addStep(graph, 'Marcando arestas remanescentes do ciclo.')

    let childToOldEdgeMap = mapNewNodesOrEdges(
        Array.from(childArborescense.values()).map(v => v[0]),
        Array.from(graph.uniqueEdges()).map(v => v[0])
    )
    // Marcando nós da arborescência filha
    for(let [destination, [edge, source]] of childArborescense.entries()) {
        // Resgata o edge anterior. Caso o edge já existisse ele estará no map, caso contrário a aresta foi reduzida
        // e seu equivalente foi guardado
        let oldEdge = childToOldEdgeMap.get(edge) ?? edge.oldEdge
        let oldDestination = reducedToOldGraphMap.get(destination) ?? edge.oldDestination
        let oldSource = reducedToOldGraphMap.get(source) ?? edge.oldDestination

        oldEdge.highlights.add(HighlightType.DARK_WITH_BLINK)
        oldEdge.marked = true


        arborescense.set(oldDestination, [edge, oldSource])
    }
    controller.addStep(graph, 'Marcando arestas da arborescência filha.')

    for(let edge of graph.uniqueEdges()) {
        if(!edge.marked) {
            graph.removeEdge(edge)
        }
    }

    controller.addStep(graph, 'Arborescência mínima encontrada.')
    return arborescense
}