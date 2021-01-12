// Node Definition
import {canvas, ctx} from "../Drawing/General.js";

export const nodeRadius = 14;
const totalBlinkingFrames = 30;
const nodeColorList = [
    // "#32E6BC", "#E6DD27", "#E67955", "#27E64D"
    // "#E9D879", "#32E6BA", "#E6DD27", "#E67855", "#27E64C"
    // "#2FD6AE", "#D6CE24", "#D6704F", "#27E64C"
    "dodgerblue", "limegreen",
    "mediumslateblue", "#8D6E63", "#4FC3F7", "burlywood", "#FF7043"
]
var colorRotation = 0
var globalNodeIndex = 0
const nodeBorderWidth = 2;
const nodeBorderColor = "transparent";

var usedLabels = new Set()


function generateNewRandomLetter() {
    let newRandomLetter;
    if (usedLabels.size < 26) {
        do {
            let randomCharCode = Math.floor(Math.random()*26)+65
            newRandomLetter = String.fromCharCode(randomCharCode)
        } while (usedLabels.has(newRandomLetter));
    } else {
        let randomCharCode = Math.floor(Math.random()*26)+65
        newRandomLetter = String.fromCharCode(randomCharCode)
    }
    return newRandomLetter;
}

export const NodeHighlightType = {
    SELECTION: 1,
    ALGORITHM_FOCUS: 2
}
export class Node {

    constructor(x, y, label) {
        this.pos = {x: x, y: y};

        this.index = globalNodeIndex++;
        let newRandomLabel = generateNewRandomLetter()
        usedLabels.add(newRandomLabel)
        this.randomLabel = newRandomLabel
        if (label != null) {
            this.label = label;
        } else {
            this.label = newRandomLabel;
        }
        this.highlight = 0;
        
        this._originalcolor = nodeColorList[colorRotation % nodeColorList.length];
        this._initialTime = window.performance.now();
        this.breatheSettings = {
            speed: 0.15,
            amplitude: 1.5,
            offset: -2.5
        }

        function getCurrentColor() {
            return this._originalcolor
        }
        Object.defineProperty(this, 'color', { get: getCurrentColor } );


        function getCurrentRadius() {
            let elapsedTime = window.performance.now() - this._initialTime;
            let speed = this.breatheSettings.speed
            let mult = this.breatheSettings.amplitude
            let offset = this.breatheSettings.offset
            if (this.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
                speed = 0.2;
                mult = 2.5;
            }
            let expansion = Math.sin((elapsedTime / 100)*speed) * mult + offset
            return nodeRadius * 2 + expansion;
        }
        Object.defineProperty(this, 'radius', { get: getCurrentRadius } );
        
        colorRotation += 1;
    }

    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    draw(nodeLabeling) {
        // Draw circle
        ctx.lineWidth = nodeBorderWidth;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = nodeBorderColor;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        // Faz o nó piscar uma cor mais clara
        if (this.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
            let t = window.performance.now()/350
            let a = Math.abs(Math.sin(t)) - 0.75
            ctx.fillStyle = "rgba(255,255,255,a)"
            ctx.fill()

            let c2 = colorFromComponents(0, 0, 0, 0.5)
            ctx.strokeStyle = c2
            ctx.lineWidth = this.radius/7
            // Raio do tracejado
            // (A soma faz com que o tracejado fique do lado de fora do círculo)
            let dashRadius = this.radius - ctx.lineWidth/2;

            ctx.setLineDash([]);
            if (dashRadius > 0) {
                // let t = window.performance.now()/2000;
                // Desenhamos a borda tracejada
                ctx.beginPath();
                // console.log("d", dashRadius)
                ctx.arc(this.pos.x, this.pos.y, dashRadius, 0 + t, 2*Math.PI + t);
                ctx.stroke();
            }
        }
        if (this.isSelected) {
            ctx.strokeStyle = "#1050FF"
            ctx.lineWidth = 4
            if (this.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
                ctx.strokeStyle = "#00A0FF"
                // ctx.lineWidth = 4
            }

            // Para mantermos o mesmo número de traços independente
            // do raio do círculo, fazemos os passos seguintes.

            // Raio do tracejado
            // (A soma faz com que o tracejado fique do lado de fora do círculo)
            let dashRadius = this.radius + ctx.lineWidth/2;
            // Circunferência do círculo (2π * r)
            let circ = 2*Math.PI * dashRadius;

            ctx.setLineDash([circ/12.5, circ/22]);

            let t = window.performance.now()/2000;
            // Desenhamos a borda tracejada
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, dashRadius, 0 + t, 2*Math.PI + t);
            ctx.stroke();
        }
        // Draw text
        ctx.font = "bold 30px Arial";
        var grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grd.addColorStop(0, "#E5E0FF");
        grd.addColorStop(1, "#FFE0F3");

        ctx.fillStyle = grd;

        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        let nodeText;
        switch (nodeLabeling) {
            case "numbers":
                nodeText = this.index;
                break;
            case "letters_randomized":
                nodeText = this.randomLabel;
                break;
            case "letters_ordered":
                nodeText = String.fromCharCode(this.index+65)
                break;
        }
        ctx.fillText(this.label || nodeText, this.pos.x, this.pos.y);
    }
    
    addHighlight(type) {
        // Checa se já está adicionado
        if ((this.highlight & type) == false) {
            this.highlight |= type;
        }
    }

    removeHighlight(type) {
        // Checa se pode ser removido
        if (this.highlight & type) {
            this.highlight &= ~type;
        }
    }

    get isSelected() {
        return this.highlight & NodeHighlightType.SELECTION;
    }
}

// export {Node, NodeHighlightType}