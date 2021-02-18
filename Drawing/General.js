let colorRotation = 0

export function resetColorRotation() {
  colorRotation = 0
}

export function getColorRotation() {
  return colorRotation++
}

// Canvas
export var canvas = document.getElementById("mainCanvas");
export var overlayCanvas = document.getElementById("overCanvas");

let ctx = canvas.getContext("2d");
export let nodeLabelingSelector = document.getElementById("nodeLabeling")
export const backgroundGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
backgroundGradient.addColorStop(0, "#E5E0FF");
backgroundGradient.addColorStop(1, "#FFE0F3");

export const nodeColorList = [
    "#32CD32",
    "#7B68EE", "#8D6E63", "#4FC3F7", "#DEB887", "#FF7043"
]

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
    WEIGHTED_EDGES: "weighted_edges",
    COLORED_EDGES: "colored_edges",
    DIRECTED_EDGES: "directed_edges"
}
// console.log("abcde")


// class Original {
//     originalMethod() {
//         console.log("original")
//     }
// }

// function newClass() {
//     return class Sub extends Original {
//         subMethod() {
//             console.log("sub2")
//         }
//     }
// }
//
// let og = new Original()
// og.originalMethod()
//
// let type = newClass()
// let sub = new type()
// // let sub = new Sub()
// sub.subMethod()
// sub.originalMethod()
// console.log(sub instanceof Sub)