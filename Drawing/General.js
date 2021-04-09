// Canvas
import { g } from "../index.js";

export var canvas = document.getElementById("mainCanvas");
export var slowOverlayCanvas = document.getElementById("slowCanvas");
export var fastOverlayCanvas = document.getElementById("fastCanvas");

export let nodeLabelingSelector = document.getElementById("nodeLabeling")
nodeLabelingSelector.onchange = function(e) {
    g.nodeLabeling = e.target.value;
    g.refreshGraph();
}

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
    CONNECT_ALL: "connect_all",
    DISCONNECT_ALL: "disconnect_all",
    DELETE_ALL: "delete_all"
}
export const HighFPSFeature = {
    MOVING: "moving",
    CONNECTING: "connecting",
    SELECTING: "selecting",
    BLINKING: "blinking",
    NODE_HIGHLIGHT: "node_highlight"
}

export const GraphCategory = {
    COLORED_NODES: "colored_nodes",
    WEIGHTED_EDGES: "weighted_edges",
    COLORED_EDGES: "colored_edges",
    DIRECTED_EDGES: "directed_edges"
}

export const Algorithm = {
    DIJKSTRA:           'Dijkstra',
    GREEDY_NODE_COLOR:  'GreedyNodeColoring',
    MST_PRIM:           'PrimMST',
    MST_KRUSKAL:        'KruskalMST',
    DFS_CYCLEDETECTION: 'DFSCycleDetection',
    MSA_EDMONDS:        'EdmondsMSA',
    EULERIANPATH:       'EulerianPath',
    FORD_FULKERSON:      'FordFulkerson'
}