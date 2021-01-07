import { ctx } from "../Drawing/General.js"
// Node Definition
export const nodeRadius = 14;
const totalBlinkingFrames = 30;
const nodeColorList = [
    // "#32E6BC", "#E6DD27", "#E67955", "#27E64D"
    // "#E9D879", "#32E6BA", "#E6DD27", "#E67855", "#27E64C"
    // "#2FD6AE", "#D6CE24", "#D6704F", "#27E64C"
    "dodgerblue", "limegreen", "#FFA0A0",
    "mediumslateblue", "#8D6E63", "deeppink", "#4FC3F7", "burlywood", "#FF7043"
]

var colorRotation = 0
class Node {

    constructor(x, y, label) {
        this.pos = {x: x, y: y};
        this.label = label;
        this._originalcolor = nodeColorList[colorRotation % nodeColorList.length];
        this._initialTime = window.performance.now();

        this._isBlinking = false;
        this._initialBlinkingTime = null;
        this.expansion = 3;

        function getCurrentColor() {
            if (this._isBlinking == true) {
                return this._originalcolor
            } else {
                return this._originalcolor
            }
            // ctx.fillStyle = this._originalcolor
        }
        Object.defineProperty(this, 'color', { get: getCurrentColor } );


        function getCurrentRadius() {
            let elapsedTime = window.performance.now() - this._initialTime;
            let speed = 0.15
            let expansion = Math.sin((elapsedTime / 100)*speed) * 1.5 - 2.5
            if (this._isBlinking) {
                // this.elapsedBlinkingTime = window.performance.now() - this._initialBlinkingTime;
                // this.expansion = Math.sin(this.blinkingFrame / totalBlinkingFrames * Math.PI)
                // expansion += Math.sin((this.elapsedBlinkingTime / 10)/(Math.PI * 3)) * 2
                expansion += Math.sin((elapsedTime / 100)*(speed*2))
            }
            return nodeRadius * 2 + expansion;
        }

        
        Object.defineProperty(this, 'radius', { get: getCurrentRadius } );
        colorRotation += 1;
    }

    blink() {
        this._initialBlinkingTime = window.performance.now();
        this._isBlinking = true;
    }

    stopBlink() {
        this._initialBlinkingTime = null
        this._isBlinking = false
    }

}

export default Node