// Node Definition
import { canvas, ctx, getColorRotation} from "../Drawing/General.js";
import { HighlightType, HighlightsHandler } from "./Highlights.js"
import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";

export const regularNodeRadius = 28;
const nodeColorList = [
    "#32CD32",
    "#7B68EE", "#8D6E63", "#4FC3F7", "#DEB887", "#FF7043"
]

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
function roundRect(ctx, x, y, width, height, radius) {
    let r = x + width;
    let b = y + height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + height - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}


function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

const transparentLabelGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
transparentLabelGradient.addColorStop(0, "#E5E0FF");
transparentLabelGradient.addColorStop(1, "#FFE0F3");

const up = Array.from({length: 26}, (_, i) => String.fromCharCode(65+i));
const low = Array.from({length: 26}, (_, i) => String.fromCharCode(97+i));
const c = Array.from({length: 10}, (_, i) => String.fromCharCode(48+i));

const positionAlphabet = up.concat(low.concat(c))

export class Node {

    constructor({x, y, label, index = null, oColor = null, highlights = null}) {

        this._initialTime = window.performance.now();
        this.index = index ?? globalNodeIndex;
        let nextColor = getColorRotation()
        this._originalcolor = oColor ?? nodeColorList[nextColor % nodeColorList.length];
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

        if (label != null) {
            this.label = label;
        } else {
            this.label = newRandomLabel;
        }
        
        this.highlights = new HighlightsHandler(highlights)
        globalNodeIndex = Math.max(globalNodeIndex, index ?? globalNodeIndex)+1;
        let roun = 5
        let m = ctx.measureText("1")
        let width = m.width + 10
        // let width = 20
        let height = 20
        this.s = `
        l${width-roun},0     q${roun},0  ${roun},${roun}
        l0,${height-roun}    q0,${roun}  -${roun},${roun}
        l-${width-roun},0    q-${roun},0 -${roun},-${roun}
        l0,-${height-roun}   q0,-${roun} ${roun},-${roun}`
        
        // Instanciando cadeia de responsabilidade
        this.drawChain = new ResponsibilityChain()

        // Adicionando procedure de draw
        this.drawChain.addLink(this.drawProcedure)
    }

    // Lista de argumentos para clonagem
    get _args() {
        return {
            x: this.pos.x,
            y: this.pos.y,
            label: this.label,
            index: this.index,
            oColor: this._originalcolor,
            highlights: new Set(this.highlights.list())
        }
    }

    get color() {
        return this._originalcolor
    }

    get radius() {
        let elapsedTime = window.performance.now() - this._initialTime;
        let speed  = this._breatheSettings.speed
        let mult   = this._breatheSettings.amplitude
        let offset = this._breatheSettings.offset
        if (this.highlight & HighlightType.ALGORITHM_FOCUS) {
            speed = 0.4;
            mult = 2.5;
        }
        let expansion = Math.sin((elapsedTime / 100)*speed) * mult + offset
        return regularNodeRadius + expansion;
    }


    // DRAWING
    _drawChain = []
    addDrawProcedure(procedure) {
        this._drawChain.push(procedure)
    }

    // Executa a cadeia de responsabilidade
    draw(...args) {
        let fpsRequests = this.drawChain.call(...args)
        fpsRequests = fpsRequests.filter(req => req != undefined)
        return Math.max(...fpsRequests)
    }


    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    drawProcedure = (nodeLabeling) => {
        // Draw circle
        ctx.lineWidth = nodeBorderWidth;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = nodeBorderColor;
        // if (this.highlights.has(HighlightType.ALGORITHM_NOTVISITED)) {
        // // ctx.lineWidth = nodeBorderWidth/2;
        //     ctx.setLineDash([10, 10]);
        // } else {
        // // ctx.lineWidth = nodeBorderWidth;
        //     ctx.setLineDash([]);
        // }

            ctx.setLineDash([]);
        ctx.beginPath();
        ctx.fillStyle = transparentLabelGradient;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 8;
        if (this.highlights.has(HighlightType.ALGORITHM_FOCUS) || this.highlights.has(HighlightType.ALGORITHM_FOCUS2)) {
            ctx.lineWidth = 8;
        } else {
            ctx.lineWidth = 8;
        }
        // if (this.highlights.has(HighlightType.ALGORITHM_FOCUS2)) {
        //     ctx.lineWidth = 8;
        // } else {
        //     ctx.lineWidth = 4;
        // }
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw highlights
        let maxFPSRequest = 0;
        for (let h of this.highlights.list()) {
            let fpsRequest = this._drawHighlight(h)
            maxFPSRequest = Math.max(maxFPSRequest, fpsRequest)
        }

        // Draw label
        let z = this.highlights.has(HighlightType.ALGORITHM_FOCUS) || (!this.highlights.has(HighlightType.ALGORITHM_FOCUS2) && this.highlights.has(HighlightType.ALGORITHM_VISITED))
        // let z = false
        this._drawLabel(nodeLabeling, z ? transparentLabelGradient : this.color)
        // let tx = Math.floor(this.pos.x)
        // let ty = Math.floor(this.pos.y)
        // let zz = `m${tx - 5},${ty - 55}` + this.s
        // // ctx.save()
        // ctx.lineWidth = 3
        // ctx.scale(0.5, 0.5)
        // ctx.translate(this.pos.x, this.pos.y)
        // for (let x = 0; x < 30; x++) {
            // roundRect(ctx,
            //         this.pos.x-10,
            //         this.pos.y-50,
            //         20, 20, 5)
            // ctx.fill()
            // this.p = new Path2D(zz);
            // ctx.fill(this.p)
        // }
        // ctx.restore()
        // ctx.fillStyle = "white"
        // ctx.font = "bold 15px Arial";
        // ctx.fillText("1", tx, ty - 45);
        // let m = ctx.measureText("1")
        //     let boxWidth = m.width + 5
        // ctx.rect(this.pos.x + boxWidth/2, this.pos.y - 70, boxWidth, 20)
        // ctx.fillStyle = "#0004"
        // ctx.fill()
        return maxFPSRequest;
    }

    _drawHighlight(highlight) {
        switch (highlight) {
            case HighlightType.SELECTION: {
                /* Borda pontilhada */
                ctx.strokeStyle = "#1050FF"
                ctx.lineWidth = 4

                /// Para mantermos o mesmo número de traços independente
                /// do raio do círculo, fazemos os passos seguintes.

                // Raio do tracejado
                // (A soma faz com que o tracejado fique do lado de fora do círculo)
                let dashRadius = this.radius + 4 + ctx.lineWidth/2;
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
            case HighlightType.ALGORITHM_FOCUS: {
                /* Fundo cinza escuro */

                ctx.fillStyle = colorFromComponents(50, 50, 50, 0.8)
                
                let circleRadius = this.radius - nodeBorderWidth
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, circleRadius, 0, 2*Math.PI);
                ctx.fill();

                return 0;
            }
            case HighlightType.ALGORITHM_FOCUS2: {
                /* Fundo colorido mas claro */

                // Colorir o fundo
                ctx.fillStyle = this._originalcolor
                
                let circleRadius = this.radius - nodeBorderWidth
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, circleRadius, 0, 2*Math.PI);
                ctx.fill();

                // Clarear o fundo
                ctx.fillStyle = colorFromComponents(255, 255, 255, 0.7)
                ctx.fill();

                return 0;
            }

            case HighlightType.ALGORITHM_VISITED: {
                /* Fundo colorido mas escurecido */

                // Colorir o fundo
                ctx.fillStyle = this._originalcolor
                
                let circleRadius = this.radius - nodeBorderWidth
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, circleRadius, 0, 2*Math.PI);
                ctx.fill();

                // Clarear o fundo
                ctx.fillStyle = colorFromComponents(50, 50, 50, 0.5)
                ctx.fill();

                return 0;
            }
            case HighlightType.ALGORITHM_RESULT: {
                /* Borda de cor forte e fundo piscando claro */

                // Configuramos a borda
                ctx.strokeStyle = colorFromComponents(0, 0, 255, 1)
                ctx.lineWidth = 5

                let borderRadius = this.radius + 8 - ctx.lineWidth/2;
                ctx.setLineDash([]);

                // Desenhamos a borda
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, borderRadius, 0, 2*Math.PI);
                ctx.stroke();

                // Pisca o fundo
                let twinkleTime = window.performance.now()/450
                let whiteLayerAlpha = Math.sin(twinkleTime) - 0.65
                ctx.fillStyle = colorFromComponents(255, 255, 255, whiteLayerAlpha)
                ctx.fill()
                return 20;
            }
        }
    }

    _drawLabel(nodeLabeling, color) {
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        let nodeText;
        switch (nodeLabeling) {
            case "numbers":
                nodeText = this.index;
                break;
            case "letters_randomized":
                nodeText = this.label;
                break;
            case "letters_ordered":
                nodeText = String.fromCharCode(this.index+65)
                break;
        }
        ctx.fillText(nodeText, this.pos.x, this.pos.y);
    }

    // HIGHLIGHTS

    get isSelected() {
        return this.highlights.has(HighlightType.SELECTION);
    }

    serialize() {
        // Colors
        let serializedColors;
        let indexOfColor = nodeColorList.indexOf(this._originalcolor)
        if (indexOfColor == -1) {
            serializedColors = this._originalcolor.slice(1)
        } else {
            serializedColors = indexOfColor;
        }
        
        // Position
        let percX = Math.round((this.pos.x / canvas.width)*61);
        let percY = Math.round((this.pos.y / canvas.height)*61);
        let serializedPosition = `${positionAlphabet[percX]}${positionAlphabet[percY]}`

        // Highlights
        let serializedHighlights = this.highlights.prepareForSharing()
        if (serializedHighlights != "") {
            serializedHighlights = "-" + serializedHighlights
        }
        
        return `${this.index}-${serializedColors}-${this.label}${serializedPosition}${serializedHighlights}`
    }

    static deserialize(serializedNode) {
        const nodeSerializationFormat = /(\d+)-(.+?)-(.+)?/i;
        let matchResult = serializedNode.match(nodeSerializationFormat);
        // console.log(serializedNode, matchResult)
        if (matchResult == undefined) return;
        let [, index, serializedColor, moreInfo] = matchResult;
        index = parseInt(index)
        // console.log("index", index)
        
        let colorMatchResult = serializedColor.match(/([a-fA-F0-9]{6})|(\d+)/i);
        if (colorMatchResult == undefined) return;
        let [, customColor, colorIndex] = colorMatchResult;
        let color = customColor ?? nodeColorList[colorIndex % nodeColorList.length];
        // console.log("color", color)

        const moreInfoFormat = /((?<label>[a-zA-Z0-9]{1,2})(?<pos>[a-zA-Z0-9]{2}))(-(?<highlights>.+))?/i
        let moreInfoResult = moreInfo.match(moreInfoFormat);
        if (moreInfoResult == undefined) return;

        let label = moreInfoResult.groups.label
        let serializedPos = moreInfoResult.groups.pos
        let serializedHighlights = moreInfoResult.groups.highlights
        // console.log("label", label)
        // console.log("pos", serializedPos)
        let highlights;
        if (serializedHighlights != null) {
            highlights = HighlightsHandler.deserialize(serializedHighlights)
        }

        let xPos = positionAlphabet.indexOf(serializedPos.charAt(0))
        let yPos = positionAlphabet.indexOf(serializedPos.charAt(1))
        if (xPos == null || yPos == null) return;
        xPos *= canvas.width/61;
        yPos *= canvas.height/61;
        
        let node = new Node({x:xPos, y:yPos, label, index, color, highlights})
        
        return node;
    }

    // Clona o nó a partir da instância atual
    clone() {
        return new this.constructor(this._args)
    }

    // Instancia a classe atual a partir de um nó existente
    static from(node) {
        return new this(node._args)
    }
}