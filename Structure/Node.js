// Node Definition
import { canvas, ctx } from "../Drawing/General.js";

export const regularNodeRadius = 28;
const nodeColorList = [
    "#1E90FF", "#32CD32",
    "#7B68EE", "#8D6E63", "#4FC3F7", "#DEB887", "#FF7043"
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
    SELECTION: "selection",
    ALGORITHM_FOCUS: "algorithm_focus"
}
function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

const transparentLabelGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
transparentLabelGradient.addColorStop(0, "#E5E0FF");
transparentLabelGradient.addColorStop(1, "#FFE0F3");

export class Node {

    constructor(x, y, label) {

        this._initialTime = window.performance.now();
        this.index = globalNodeIndex++;
        this._originalcolor = nodeColorList[colorRotation % nodeColorList.length];
        this._breatheSettings = {
            speed: 0.15,
            amplitude: 1.5,
            offset: -2.5
        }

        // Posição
        this.pos = {x: x, y: y};

        // Informações de label
        let newRandomLabel = generateNewRandomLetter()
        usedLabels.add(newRandomLabel)
        this.randomLabel = newRandomLabel

        if (label != null) {
            this.label = label;
        } else {
            this.label = newRandomLabel;
        }
        
        this.highlights = new Set();
        
        colorRotation += 1;
    }

    get color() {
        return this._originalcolor
    }

    get radius() {
        let elapsedTime = window.performance.now() - this._initialTime;
        let speed  = this._breatheSettings.speed
        let mult   = this._breatheSettings.amplitude
        let offset = this._breatheSettings.offset
        if (this.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
            speed = 0.4;
            mult = 2.5;
        }
        let expansion = Math.sin((elapsedTime / 100)*speed) * mult + offset
        return regularNodeRadius + expansion;
    }


    // DRAWING

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

        // Draw highlights
        let maxFPSRequest = 0;
        for (let h of this.highlights) {
            let fpsRequest = this._drawHighlight(h)
            maxFPSRequest = Math.max(maxFPSRequest, fpsRequest)
        }

        // Draw label
        this._drawLabel(nodeLabeling)

        return maxFPSRequest;
    }

    _drawHighlight(highlight) {
        switch (highlight) {
            case NodeHighlightType.SELECTION: {
                ctx.strokeStyle = "#1050FF"
                ctx.lineWidth = 4

                /// Para mantermos o mesmo número de traços independente
                /// do raio do círculo, fazemos os passos seguintes.

                // Raio do tracejado
                // (A soma faz com que o tracejado fique do lado de fora do círculo)
                let dashRadius = this.radius + ctx.lineWidth/2;
                // Circunferência do círculo (2π * r)
                let circunference = 2*Math.PI * dashRadius;

                ctx.setLineDash([circunference/12.5, circunference/22]);

                let rotationOffset = window.performance.now()/2000;
                // Desenhamos a borda tracejada
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, dashRadius,
                        rotationOffset, 2*Math.PI + rotationOffset);
                ctx.stroke();
                return 20;
            }
            case NodeHighlightType.ALGORITHM_FOCUS: {
                // Pisca o nó
                let twinkleTime = window.performance.now()/500
                let whiteLayerAlpha = Math.abs(Math.sin(twinkleTime)) - 0.7
                ctx.fillStyle = colorFromComponents(255, 255, 255, whiteLayerAlpha)
                ctx.fill()

                // Borda clara
                ctx.strokeStyle = colorFromComponents(255, 255, 255, 0.5)
                ctx.lineWidth = this.radius/7
                
                // Raio do tracejado
                let lightBorderRadius = this.radius - ctx.lineWidth/2
                ctx.setLineDash([]);
                if (lightBorderRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, lightBorderRadius, 0, 2*Math.PI);
                    ctx.stroke();
                }
                return 20;
            }
        }
    }

    _drawLabel(nodeLabeling) {
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = transparentLabelGradient;
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
        ctx.fillText(nodeText, this.pos.x, this.pos.y);
    }

    // HIGHLIGHTS
    
    addHighlight(type) {
        this.highlights.add(type)
    }

    removeHighlight(type) {
        this.highlights.delete(type)
    }

    get isSelected() {
        return this.highlights.has(NodeHighlightType.SELECTION);
    }

    serialize() {
        // index  originalcolor customcolor  randomlabel customlabel  posx posy  highlights
        // 0;9,;"U",;700,400;2;
        let serializedColors = `${nodeColorList.indexOf(this._originalcolor)}_`
        
        let serializedLabels = `${this.randomLabel}_${this.label != this.randomLabel ? this.label : ""}`
        
        let percX = Math.round((this.pos.x/canvas.width)*100);
        let percY = Math.round((this.pos.y/canvas.height)*100);
        let serializedPosition = `${percX}_${percY}`

        let highlightNames = Object.entries(NodeHighlightType).map(entry => entry[1]).flat()
        let numberedHighlights = Array.from(this.highlights).map(h => highlightNames.indexOf(h))
        
        return `${this.index}-${serializedColors}-${serializedLabels}-${serializedPosition}-${numberedHighlights}-`
    }

    static deserialize(string) {
        const re = /(\d)-([#0-9A-F]+)_([#0-9A-F]*)-([a-zA-Z])_([a-zA-Z])?-(\d+)_(\d+)-(.*)-(.*)/i;
        // index  originalcolor customcolor  randomlabel customlabel  posx posy  highlights
        let found = string.match(re);
        if (found == undefined) {return;}
        const [_, index, oColor, cColor, rLabel, cLabel, x, y, highlights] = found;

        let newX = x*canvas.width/100
        let newY = y*canvas.height/100
        // console.log(rLabel, cLabel, newX, newY, canvas.width, canvas.height)
        let node = new Node(newX, newY, rLabel)
        node.index = parseInt(index)
        this._originalcolor = nodeColorList[oColor % nodeColorList.length];
        node.randomLabel = rLabel
        let highlightNames = Object.entries(NodeHighlightType).map(entry => entry[1]).flat()
        node.highlights = new Set(highlights.split(",").map(h => highlightNames[h]))
        return node
    }
}