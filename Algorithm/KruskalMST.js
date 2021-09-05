/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import UnionFind from "./Auxiliary/UnionFind.js";
import {HighlightType} from "../Utilities/Highlights.js";
import Explanation from "./Explanations/KruskalMSTExplanation.js";
import pseudocode from "../Algorithm/Pseudocodes/KruskalMST.htm";

export default function KruskalMST(controller) {
    let graph = controller.graphView.structure

    controller.setPseudocode(pseudocode)

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