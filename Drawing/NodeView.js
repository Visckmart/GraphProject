// // Node Definition
// const totalBlinkingFrames = 30;
// const nodeColorList = [
//     "darkorange", "gold", "lightskyblue", "springgreen", "crimson",
//     "mediumslateblue", "deeppink", "chocolate", "limegreen"
// ]

// class NodeView {

//     constructor(x, y, num) {
//         this.pos = {x: x, y: y};
//         this.info = new Node(num);
//         this.initialTime = window.performance.now();

//         this.isBlinking = false;
//         this.initialBlinkingTime = null;

//         function getCurrentColor() {
//             if (this.isBlinking == true) {
//                 ctx.fillStyle = "red";
//             } else {
//                 ctx.fillStyle = nodeColorList[this.num % nodeColorList.length]
//             }
//         }

//         Object.defineProperty(this, 'color', { get: getCurrentColor } );
//     }


//     update(timestamp) {
//         // if (!this.isBlinking) { return; }
//         // console.log(timestamp, timestamp - this.initialDate)
//         let elapsedTime = timestamp - this.initialTime;
//         let speed = 0.15
//         this.expansion = Math.sin((elapsedTime / 100)*speed) * 1.5 - 2.5;
        
//         if (this.isBlinking) {
//             this.elapsedBlinkingTime = timestamp - this.initialBlinkingTime;
//             // this.expansion = Math.sin(this.blinkingFrame / totalBlinkingFrames * Math.PI)
//             this.expansion += Math.sin((this.elapsedBlinkingTime / 10)/(Math.PI * 3)) * 2
//             // console.log("x")
//             // this.blinkingFrame += 1;
//             if (timestamp - this.initialBlinkingTime > 300) {
//                 this.isBlinking = false;
//                 this.initialBlinkingTime = 0;
//             }
//         }
//     }

//     blink() {
//         this.initialBlinkingTime = window.performance.now();
//         this.isBlinking = true;
//     }

// }