import UnionFind from "./Auxiliary/UnionFind.js";
import {HighlightType} from "../Utilities/Highlights.js";
import Explanation from "./Explanations/KruskalMSTExplanation.js";

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

    controller.addStep(graph, Explanation.init(nodes.length), 'init')

    while(edges.length > 0) {
        let [edge, nodeA, nodeB] = edges.pop()

        edge.highlights.remove(HighlightType.DISABLED)
        edge.highlights.add(HighlightType.COLORED_A)


        if(unionFind.find(nodeA) !== unionFind.find(nodeB)) {
            edge.highlights.remove(HighlightType.DISABLED)

            nodeA.highlights.add(HighlightType.COLORED_BORDER2)
            nodeB.highlights.add(HighlightType.COLORED_BORDER2)

            unionFind.union(nodeA, nodeB)

            controller.addStep(graph,
                               Explanation.edgeAddition(edge.assignedValue,
                                                        nodeA,
                                                        nodeB),
                               'include')

            nodeA.highlights.remove(HighlightType.COLORED_BORDER2)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER2)
        } else {
            edge.highlights.add(HighlightType.FEATURE_PREVIEW)
            nodeA.highlights.add(HighlightType.COLORED_BORDER2)
            nodeB.highlights.add(HighlightType.COLORED_BORDER2)

            controller.addStep(graph,
                               Explanation.edgeIgnored(edge.assignedValue,
                                                        nodeA,
                                                        nodeB),
                               'notInclude')

            nodeA.highlights.remove(HighlightType.COLORED_BORDER2)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER2)
            edge.highlights.remove(HighlightType.FEATURE_PREVIEW)

            edge.highlights.add(HighlightType.DISABLED)
        }
        edge.highlights.remove(HighlightType.COLORED_A)
    }

    let parentTree = unionFind.find(nodes[0], false)
    let moreThanOneTree = nodes.some(node => unionFind.find(node, false) !== parentTree)
    controller.addStep(graph, Explanation.conclusion(!moreThanOneTree))
}