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

let ma = document.getElementsByClassName("menuArea")[0];
// console.log(ma)
ma.style.width = window.innerWidth*0.25;
ma.style.height = canvas.height;
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