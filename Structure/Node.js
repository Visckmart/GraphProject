// Node Definition
const totalBlinkingFrames = 30;
const nodeColorList = [
    "darkorange", "gold", "lightskyblue", "springgreen", "crimson",
    "mediumslateblue", "deeppink", "chocolate", "limegreen"
]

var colorRotation = 2
class Node {

    constructor(x, y, label) {
        this.pos = {x: x, y: y};
        this.label = label;
        this._originalcolor = nodeColorList[colorRotation % nodeColorList.length];
        this._initialTime = window.performance.now();

        this._isBlinking = false;
        this._initialBlinkingTime = null;

        function getCurrentColor() {
            if (this._isBlinking == true) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = this._originalcolor
            }
        }

        Object.defineProperty(this, 'color', { get: getCurrentColor } );
        colorRotation += 1;
    }


    update(timestamp) {
        // if (!this._isBlinking) { return; }
        // console.log(timestamp, timestamp - this.initialDate)
        let elapsedTime = timestamp - this._initialTime;
        let speed = 0.15
        this.expansion = Math.sin((elapsedTime / 100)*speed) * 1.5 - 2.5;
        
        if (this._isBlinking) {
            this.elapsedBlinkingTime = timestamp - this._initialBlinkingTime;
            // this.expansion = Math.sin(this.blinkingFrame / totalBlinkingFrames * Math.PI)
            this.expansion += Math.sin((this.elapsedBlinkingTime / 10)/(Math.PI * 3)) * 2
            // console.log("x")
            // this.blinkingFrame += 1;
            if (timestamp - this._initialBlinkingTime > 300) {
                this._isBlinking = false;
                this._initialBlinkingTime = 0;
            }
        }
    }

    blink() {
        this._initialBlinkingTime = window.performance.now();
        this._isBlinking = true;
    }

}