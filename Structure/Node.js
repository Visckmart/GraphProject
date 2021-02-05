// Node Definition
import { canvas, ctx, getColorRotation} from "../Drawing/General.js";

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

export const NodeHighlightType = {
    SELECTION: "selection",
    ALGORITHM_FOCUS: "algorithm_focus",
    ALGORITHM_FOCUS2: "algorithm_focus2",
    ALGORITHM_VISITED: "algorithm_visited",
    ALGORITHM_NOTVISITED: "algorithm_notvisited",
    ALGORITHM_RESULT: "algorithm_result",
    FEATURE_PREVIEW: "feature_preview"
}
export const highlightNames = Object.entries(NodeHighlightType).map(entry => entry[1]).flat()
function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

const transparentLabelGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
transparentLabelGradient.addColorStop(0, "#E5E0FF");
transparentLabelGradient.addColorStop(1, "#FFE0F3");
const filteredOutHighlights = [
    NodeHighlightType.SELECTION,
]

export function prepareHighlightsForSharing(highlights) {
    let highlightsCopy = new Set(highlights)
    for (let highlight of filteredOutHighlights) {
        highlightsCopy.delete(highlight)
    }
    let serializedHighlights = Array.from(highlightsCopy)
                                .map(hName => highlightNames.indexOf(hName))
                                .filter(hNum => hNum != -1)
                                .join("_")
    return serializedHighlights
}
export function deserializeHighlights(serializedHighlights) {
    if (serializedHighlights.length > 0) {
        let namedHighlights = serializedHighlights.split("_").map(hNum => highlightNames[hNum])
        return new Set(namedHighlights)
    }
    return null
}

const up = Array.from({length: 26}, (_, i) => String.fromCharCode(65+i));
const low = Array.from({length: 26}, (_, i) => String.fromCharCode(97+i));
const c = Array.from({length: 10}, (_, i) => String.fromCharCode(48+i));

const positionAlphabet = up.concat(low.concat(c))

export class Node {

    constructor(x, y, label, index = null, oColor = null, highlights = null) {

        this._initialTime = window.performance.now() + Math.random()*1000;
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
        
        this.highlights = highlights ?? new Set();
        globalNodeIndex = Math.max(globalNodeIndex, index ?? globalNodeIndex)+1;

        // Adicionando procedure de draw
        this.addDrawProcedure(this.drawProcedure)
    }

    // Lista de argumentos para clonagem
    get _args() {
        return {
            x: this.pos.x,
            y: this.pos.y,
            label: this.label,
            index: this.index,
            oColor: this._originalcolor,
            highlights: new Set(this.highlights)
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
        if (this.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
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
        let fpsRequests = []
        for(let procedure of this._drawChain) {
            fpsRequests.push(procedure(...args))
        }
        return Math.max(...fpsRequests)
    }


    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    drawProcedure = (nodeLabeling) => {
        // Draw circle
        ctx.lineWidth = nodeBorderWidth;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = nodeBorderColor;
        // if (this.highlights.has(NodeHighlightType.ALGORITHM_NOTVISITED)) {
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
        if (this.highlights.has(NodeHighlightType.ALGORITHM_FOCUS) || this.highlights.has(NodeHighlightType.ALGORITHM_FOCUS2)) {
            ctx.lineWidth = 8;
        } else {
            ctx.lineWidth = 8;
        }
        // if (this.highlights.has(NodeHighlightType.ALGORITHM_FOCUS2)) {
        //     ctx.lineWidth = 8;
        // } else {
        //     ctx.lineWidth = 4;
        // }
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
        let z = this.highlights.has(NodeHighlightType.ALGORITHM_FOCUS) || (!this.highlights.has(NodeHighlightType.ALGORITHM_FOCUS2) && this.highlights.has(NodeHighlightType.ALGORITHM_VISITED))
        // let z = false
        this._drawLabel(nodeLabeling, z ? transparentLabelGradient : this.color)

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
            case NodeHighlightType.ALGORITHM_FOCUS: {
                // Pisca o nó
                let twinkleTime = window.performance.now()/300
                let whiteLayerAlpha = Math.sin(twinkleTime)*0.3 - 0.3
                // ctx.setLineDash([]);
                // ctx.strokeStyle = colorFromComponents(255, 255, 255, whiteLayerAlpha)
                // ctx.stroke()

                // Borda clara
                let r = 150
                let g = 200
                let b = 150
                ctx.fillStyle = this._originalcolor
                // ctx.lineWidth = 10
                
                // Raio do tracejado
                let lightBorderRadius = this.radius - nodeBorderWidth
                if (lightBorderRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, lightBorderRadius, 0, 2*Math.PI);
                    ctx.fill();
                }
                return 20;
            }
            case NodeHighlightType.ALGORITHM_FOCUS2: {
                // Pisca o nó
                let twinkleTime = window.performance.now()/300
                let whiteLayerAlpha = Math.sin(twinkleTime)*0.3 - 0.3
                // ctx.setLineDash([]);
                // ctx.strokeStyle = colorFromComponents(255, 255, 255, whiteLayerAlpha)
                // ctx.stroke()

                // Borda clara
                let r = 150
                let g = 200
                let b = 150
                ctx.fillStyle = this._originalcolor
                // ctx.lineWidth = 10
                
                // Raio do tracejado
                let lightBorderRadius = this.radius - nodeBorderWidth
                if (lightBorderRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, lightBorderRadius, 0, 2*Math.PI);
                    ctx.fill();
                }
                // Borda clara
                ctx.fillStyle = colorFromComponents(255, 255, 255, 0.7)
                // ctx.lineWidth = 10
                
                // Raio do tracejado
                lightBorderRadius = this.radius - nodeBorderWidth
                if (lightBorderRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, lightBorderRadius, 0, 2*Math.PI);
                    ctx.fill();
                }
                return 20;
            }
            case NodeHighlightType.ALGORITHM_VISITED: {
                // Pisca o nó
                let twinkleTime = window.performance.now()/1000
                let whiteLayerAlpha = Math.sin(twinkleTime)*0.3 + 0.3 + 0.75
                // ctx.setLineDash([]);
                // ctx.strokeStyle = colorFromComponents(255, 255, 255, whiteLayerAlpha)
                // ctx.stroke()

                // Borda clara
                ctx.fillStyle = this._originalcolor
                // ctx.lineWidth = 10
                
                // Raio do tracejado
                let lightBorderRadius = this.radius - nodeBorderWidth
                if (lightBorderRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, lightBorderRadius, 0, 2*Math.PI);
                    ctx.fill();
                }
                // Borda clara
                ctx.fillStyle = colorFromComponents(50, 50, 50, 0.5)
                // ctx.lineWidth = 10
                
                // Raio do tracejado
                lightBorderRadius = this.radius - nodeBorderWidth
                if (lightBorderRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, lightBorderRadius, 0, 2*Math.PI);
                    ctx.fill();
                }
                return 20;
            }
            case NodeHighlightType.ALGORITHM_RESULT: {
                
                ctx.strokeStyle = "blue"
                ctx.lineWidth = 8

                /// Para mantermos o mesmo número de traços independente
                /// do raio do círculo, fazemos os passos seguintes.

                // Raio do tracejado
                // (A soma faz com que o tracejado fique do lado de fora do círculo)
                let dashRadius = this.radius + ctx.lineWidth/2;
                // Circunferência do círculo (2π * r)
                let circunference = 2*Math.PI * dashRadius;

                ctx.setLineDash([]);
                // Desenhamos a borda tracejada
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, dashRadius, 0, 2*Math.PI);
                ctx.stroke();
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
        let serializedHighlights = prepareHighlightsForSharing(this.highlights)
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
            highlights = deserializeHighlights(serializedHighlights)
        }

        let xPos = positionAlphabet.indexOf(serializedPos.charAt(0))
        let yPos = positionAlphabet.indexOf(serializedPos.charAt(1))
        if (xPos == null || yPos == null) return;
        xPos *= canvas.width/61;
        yPos *= canvas.height/61;
        
        let node = new Node(xPos, yPos, label, index, color, highlights)
        
        return node;
    }

    static from(node) {
        return new this(node._args)
    }
}