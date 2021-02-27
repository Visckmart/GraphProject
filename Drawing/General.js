// Canvas
export var canvas = document.getElementById("mainCanvas");
export var slowOverlayCanvas = document.getElementById("slowCanvas");
export var fastOverlayCanvas = document.getElementById("fastCanvas");

let ctx = canvas.getContext("2d");
export let nodeLabelingSelector = document.getElementById("nodeLabeling")
// TODO: Gradiente deveria atualizar quando o tamanho atualiza
export const backgroundGradient = ctx.createLinearGradient(0, 0, 700, 0);
backgroundGradient.addColorStop(0, "#E5E0FF");
backgroundGradient.addColorStop(1, "#FFE0F3");

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