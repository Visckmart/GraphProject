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
canvas.height = window.innerHeight*0.75;
// resizeCanvasToDisplaySize(canvas)
export var ctx = canvas.getContext("2d");

// Animation
var requestAnimationFrame = window.requestAnimationFrame || 
                        window.mozRequestAnimationFrame || 
                        window.webkitRequestAnimationFrame || 
                        window.msRequestAnimationFrame;

export const Tool = {
    MOVE: "move",
    CONNECT: "connect"
}
export const HighFPSFeature = {
    MOVING: "moving",
    CONNECTING: "connecting",
    SELECTING: "selecting",
    BLINKING: "blinking"
}
// function include(file) { 
//     var script = document.createElement('script'); 
//     script.src = file+"?random="+(new Date).getTime(); 
//     script.type = 'text/javascript'; 
//     script.defer = false; 

//     document.getElementsByTagName('head').item(0).appendChild(script); 
// }

/* Include Many js files */
// include('NodeView.js'); 
// include('Graph.js');
// include('Interaction.js');