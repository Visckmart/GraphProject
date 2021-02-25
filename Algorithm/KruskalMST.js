import UnionFind from "./Auxiliary/UnionFind.js";
import {HighlightType} from "../Structure/Highlights.js";


export default function KruskalMST(controller) {
    let graph = controller.graphView.structure

    let nodes = Array.from(graph.nodes())
    let unionFind = new UnionFind(nodes)
    controller.showcasing = unionFind

    let edges = Array.from(graph.uniqueEdges())
    edges.sort((e1, e2) => e2[0].assignedValue - e1[0].assignedValue)

    edges.forEach(([edge,,]) => {
        edge.highlights.add(HighlightType.ALGORITHM_NOTVISITED)
    })

    controller.addStep(graph, `Inicializando uma floresta com ${nodes.length} árvores compostas por nós desconexos. \
    Ordenando as arestas pelos seus pesos`)

    while(edges.length > 0) {
        let [edge, nodeA, nodeB] = edges.pop()

        if(unionFind.find(nodeA) !== unionFind.find(nodeB)) {
            edge.highlights.remove(HighlightType.ALGORITHM_NOTVISITED)
            edge.highlights.add(HighlightType.DARK_WITH_BLINK)

            nodeA.highlights.add(HighlightType.COLORED_BORDER)
            nodeB.highlights.add(HighlightType.COLORED_BORDER)

            unionFind.union(nodeA, nodeB)

            controller.addStep(graph, `A aresta conecta duas florestas diferentes contendo os nós \
            ${nodeA.toString()} e ${nodeB.toString()} e portanto será inclusa, unindo-as.`)

            nodeA.highlights.remove(HighlightType.COLORED_BORDER)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER)

            edge.highlights.remove(HighlightType.DARK_WITH_BLINK)
        } else {
            edge.highlights.add(HighlightType.FEATURE_PREVIEW)

            nodeA.highlights.add(HighlightType.COLORED_BORDER)
            nodeB.highlights.add(HighlightType.COLORED_BORDER)

            controller.addStep(graph, `A aresta conecta dois s nós \
            ${nodeA.toString()} e ${nodeB.toString()} da mesma floresta \
             e portanto não será inclusa.`)

            nodeA.highlights.remove(HighlightType.COLORED_BORDER)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER)

            edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
        }
    }

    let parent = unionFind.find(nodes[0], false)
    if(nodes.some(node => unionFind.find(node, false) !== parent)) {
        controller.addStep(graph, 'O grafo era desconexo e uma MST não foi encontrada.')
    } else {
        controller.addStep(graph, 'Todas as florestas foram unidas e a MST foi encontrada.')
    }
}