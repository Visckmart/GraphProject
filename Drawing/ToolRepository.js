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

import { Tool } from "./General.js";

function getTargetElements(graphView) {
    let hasSelectedNodes = graphView.selectionHandler.hasSelectedNodes;
    let hasSelectedEdges = graphView.selectionHandler.hasSelectedEdges;

    let targetNodes = [];
    if (hasSelectedNodes) {
        targetNodes = graphView.selectionHandler.selected.nodes;
    } else if (!hasSelectedEdges) {
        targetNodes = Array.from(graphView.structure.nodes());
    }

    let targetEdges = [];
    if (hasSelectedEdges) {
        targetEdges = graphView.selectionHandler.selected.edges;
    } else if (!hasSelectedNodes) {
        targetEdges = Array.from(graphView.structure.uniqueEdges())
                           .map(edgeInfo => edgeInfo[0]);
    }
    return [targetNodes, targetEdges];
}

export default {
    [Tool.SNAP_TO_GRID]: function () {
        let [targetNodes,] = getTargetElements(this);
        this.snapNodesToGrid(targetNodes);
        this.refreshGraph();
    },
    [Tool.CONNECT_ALL]: function () {
        let [targetNodes,] = getTargetElements(this);

        for (let node of targetNodes) {
            for (let innerNode of targetNodes) {
                if (node.index === innerNode.index) continue;
                this.insertEdgeBetween(node, innerNode, false)
            }
        }

        this.refreshGraph();
    },

    [Tool.DISCONNECT_ALL]: function () {
        console.log(this)
        let [targetNodes,targetEdges] = getTargetElements(this);

        console.group("Desconectar " + targetNodes.length + " nós");
        for (let edge of targetEdges) {
            this.structure.removeEdge(edge);
        }
        for (let node of targetNodes) {
            for (let [edge, , ] of this.structure.edgesFrom(node)) {
                this.structure.removeEdge(edge);
            }
        }

        console.groupEnd();
        this.refreshGraph();
    },

    [Tool.DELETE_ALL]: function () {
        let [targetNodes, targetEdges] = getTargetElements(this);
        for (let edge of targetEdges) {
            this.structure.removeEdge(edge);
        }
        for (let node of targetNodes) {
            this.structure.removeNode(node);
        }
        this.selectionHandler.clear();
        this.refreshGraph();
    }
}