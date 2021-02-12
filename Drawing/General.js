let colorRotation = 0

export function resetColorRotation() {
  colorRotation = 0
}

export function getColorRotation() {
  return colorRotation++
}

// Canvas
export var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth*0.75;
canvas.height = window.innerHeight*0.95;

export var ctx = canvas.getContext("2d");
export let nodeLabelingSelector = document.getElementById("nodeLabeling")

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