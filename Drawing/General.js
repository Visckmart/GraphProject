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

// Canvas
export var canvas = document.getElementById("mainCanvas");
export var slowOverlayCanvas = document.getElementById("slowCanvas");
export var fastOverlayCanvas = document.getElementById("fastCanvas");

export let nodeLabelingSelector = document.getElementById("nodeLabeling")

export let globalNodeIndex = 0;
export function incrementGlobalIndex(newValue = null) {
    globalNodeIndex = newValue ?? globalNodeIndex+1;
}
export const nodeColorList = [
    "#5982FF",
    "#FC58D9",
    "#30BEFF",
    "#FF9500",
    "#FE574C",
    "#E6CB00"
]

export const CanvasType = {
    GENERAL: "general",
    SLOW: "slow",
    FAST: "fast"
}

export const Tool = {
    MOVE: "move",
    CONNECT: "connect",
    SNAP_TO_GRID: "snap_to_grid",
    CONNECT_ALL: "connect_all",
    DISCONNECT_ALL: "disconnect_all",
    DELETE_ALL: "delete_all"
}
export const HighFPSFeature = {
    MOVING: "moving",
    CONNECTING: "connecting",
    SELECTING: "selecting",
    BLINKING: "blinking",
    NODE_HIGHLIGHT: "node_highlight",
    HOLDING: "holding"
}

export const GraphCategory = {
    COLORED_NODES: "colored_nodes",
    WEIGHTED_EDGES: "weighted_edges",
    COLORED_EDGES: "colored_edges",
    DIRECTED_EDGES: "directed_edges"
}

export const Algorithm = {
    DFS:                'DFS',
    BFS:                'BFS',
    DIJKSTRA:           'Dijkstra',
    GREEDY_NODE_COLOR:  'GreedyNodeColoring',
    MST_PRIM:           'PrimMST',
    MST_KRUSKAL:        'KruskalMST',
    DFS_CYCLEDETECTION: 'DFSCycleDetection',
    MSA_EDMONDS:        'EdmondsMSA',
    EULERIANPATH:       'EulerianPath',
    FORD_FULKERSON:      'FordFulkerson'
}