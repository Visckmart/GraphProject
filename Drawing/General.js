function resizeCanvasToDisplaySize(canvas) {
   // look up the size the canvas is being displayed
   const width = canvas.clientWidth;
   const height = canvas.clientHeight;

   // If it's resolution does not match change it
   if (canvas.width !== width || canvas.height !== height) {
     canvas.width = width;
     canvas.height = height;
     return true;
   }

   return false;
}

// Canvas
export var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth*0.75;
canvas.height = window.innerHeight*0.95;
// resizeCanvasToDisplaySize(canvas)
export var ctx = canvas.getContext("2d");
export let nodeLabelingSelector = document.getElementById("nodeLabeling")
// Animation
var requestAnimationFrame = window.requestAnimationFrame || 
                        window.mozRequestAnimationFrame || 
                        window.webkitRequestAnimationFrame || 
                        window.msRequestAnimationFrame;

export const Tool = {
    MOVE: "move",
    CONNECT: "connect",
    CONNECT_ALL: "connect_all"
}
export const HighFPSFeature = {
    MOVING: "moving",
    CONNECTING: "connecting",
    SELECTING: "selecting",
    BLINKING: "blinking"
}