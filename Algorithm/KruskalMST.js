import UnionFind from "./Auxiliary/UnionFind.js";
import {HighlightType} from "../Utilities/Highlights.js";

export default function KruskalMST(controller) {
    let graph = controller.graphView.structure

    controller.setPseudocode('../Algorithm/Pseudocodes/KruskalMST.html')

    let nodes = Array.from(graph.nodes())
    let unionFind = new UnionFind(nodes)
    controller.showcasing = unionFind

    let edges = Array.from(graph.uniqueEdges())
    edges.sort((e1, e2) => e2[0].assignedValue - e1[0].assignedValue)

    edges.forEach(([edge,,]) => {
        edge.highlights.add(HighlightType.DISABLED)
    })

    controller.addStep(graph, `Inicializando uma floresta com ${nodes.length} árvores compostas por nós desconexos. \
    Ordenando as arestas pelos seus pesos`, 'init')

    while(edges.length > 0) {
        let [edge, nodeA, nodeB] = edges.pop()

        edge.highlights.remove(HighlightType.DISABLED)
        edge.highlights.add(HighlightType.COLORED_A)
        controller.addStep(graph, 'Observando a aresta remanescente com menor peso.', 'loopStart')
        // edge.highlights.remove(HighlightType.COLORED_A)


        if(unionFind.find(nodeA) !== unionFind.find(nodeB)) {
            edge.highlights.remove(HighlightType.DISABLED)
            // edge.highlights.add(HighlightType.DARKEN)

            nodeA.highlights.add(HighlightType.COLORED_BORDER2)
            nodeB.highlights.add(HighlightType.COLORED_BORDER2)

            unionFind.union(nodeA, nodeB)

            controller.addStep(graph, `A aresta conecta duas florestas diferentes contendo os nós \
            ${nodeA.toString()} e ${nodeB.toString()} e portanto será inclusa, unindo-as.`, 'include')

            nodeA.highlights.remove(HighlightType.COLORED_BORDER2)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER2)
            // edge.highlights.remove(HighlightType.DARKEN)
        } else {
            edge.highlights.add(HighlightType.FEATURE_PREVIEW)

            nodeA.highlights.add(HighlightType.COLORED_BORDER2)
            nodeB.highlights.add(HighlightType.COLORED_BORDER2)

            controller.addStep(graph, `A aresta conecta dois nós \
            ${nodeA.toString()} e ${nodeB.toString()} da mesma floresta \
             e portanto não será incluída.`, 'notInclude')

            nodeA.highlights.remove(HighlightType.COLORED_BORDER2)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER2)

            edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
            edge.highlights.add(HighlightType.DISABLED)
        }
        edge.highlights.remove(HighlightType.COLORED_A)
    }

    let parent = unionFind.find(nodes[0], false)
    if(nodes.some(node => unionFind.find(node, false) !== parent)) {
        controller.addStep(graph, 'O grafo era desconexo e uma MST não foi encontrada.', 'notFound')
    } else {
        controller.addStep(graph, 'Todas as florestas foram unidas e a MST foi encontrada.', 'found')
    }
}