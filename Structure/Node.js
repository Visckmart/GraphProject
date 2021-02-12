// Node Definition
import {canvas, ctx, getColorRotation, nodeColorList} from "../Drawing/General.js";

import { HighlightType, HighlightsHandler } from "./Highlights.js"
import { generateNewRandomLabel, backgroundGradient, positionAlphabet, colorFromComponents } from "./Utilities.js";
import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";

import { deserializeNode, serializeNode } from "./NodeSerialization.js";

const regularNodeRadius = 28;

let globalNodeIndex = 0

export default class Node {

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
        this.label = label ?? generateNewRandomLabel();
        
        this.highlights = new HighlightsHandler(highlights)
        globalNodeIndex = Math.max(globalNodeIndex, index ?? globalNodeIndex)+1;
        
        // Instanciando cadeia de responsabilidade
        this.drawChain = new ResponsibilityChain()

        // Adicionando procedure de draw
        this.drawChain.addLink(this.drawProcedure)

        this.serializationChain = new ResponsibilityChain();
        this.serializationChain.addLink(serializeNode.bind(this));
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
    set color(value) {
        this._originalcolor = value
    }

    get radius() {
        let elapsedTime = window.performance.now() - this._initialTime;
        let speed  = this._breatheSettings.speed;
        let mult   = this._breatheSettings.amplitude;
        let offset = this._breatheSettings.offset;
        let expansion = Math.sin((elapsedTime / 100)*speed) * mult + offset;
        return regularNodeRadius + expansion;
    }


    // DRAWING
    _drawChain = []
    addDrawProcedure(procedure) {
        this._drawChain.push(procedure)
    }

    // Executa a cadeia de desenhos
    draw(...args) {
        let fpsRequests = this.drawChain.call(...args)
        fpsRequests = fpsRequests.filter(req => req !== undefined)
        return Math.max(...fpsRequests)
    }


    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    drawProcedure = (nodeLabeling) => {
        // Draw circle border
        ctx.save()
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);

        let hasHighlightWithBG = this.highlights.has(HighlightType.DARK_WITH_BLINK)
                                 || this.highlights.has(HighlightType.LIGHTEN)
                                 || this.highlights.has(HighlightType.DARKEN)
                                 || this.highlights.has(HighlightType.COLORED_BORDER)
        if (!hasHighlightWithBG) {
            ctx.fillStyle = backgroundGradient;
        } else {
            ctx.fillStyle = this._originalcolor;
        }
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius - ctx.lineWidth/2, 0, 2*Math.PI);

        // Draw highlights
        ctx.save()
        let fpsRequests = this._drawHighlights()
        ctx.restore()
        let maxFPSRequest = Math.max(...fpsRequests)

        // Draw label
        let transparentText = !this.highlights.has(HighlightType.LIGHTEN)
                               && this.highlights.has(HighlightType.DARKEN)
        this._drawLabel(nodeLabeling, transparentText ? backgroundGradient : this.color)

        ctx.restore();

        return maxFPSRequest;
    }

    // HIGHLIGHTS

    _drawHighlights() {
        let fpsRequests = [0]
        if (this.highlights.has(HighlightType.SELECTION)) {
            /* Borda pontilhada */
            ctx.save()

            ctx.strokeStyle = "#1050FF"
            ctx.lineWidth = 4

            // Raio do tracejado
            // (A soma faz com que o tracejado fique do lado de fora do círculo)
            let dashRadius = this.radius + 4 + ctx.lineWidth / 2;

            /// Para mantermos o mesmo número de traços independente
            /// do raio do círculo, fazemos os passos seguintes.
            // Circunferência do círculo (2π * r)
            let circunference = 2 * Math.PI * dashRadius;

            ctx.setLineDash([circunference / 12.5, circunference / 22]);

            let rotationOffset = window.performance.now() / 3000;
            // Desenhamos a borda tracejada
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, dashRadius,
                rotationOffset, 2 * Math.PI + rotationOffset);
            ctx.stroke();

            ctx.restore();
            fpsRequests.push(20);
        }

        if (this.highlights.has(HighlightType.DARK_WITH_BLINK)) {
            /* Fundo cinza escuro */
            // drawPreservingState(ctx, () => {
            ctx.save();
            if (this.highlights.has(HighlightType.COLORED_BORDER)) {
                let twinkleTime = window.performance.now() / 500;
                let whiteLayerAlpha = -(Math.sin(twinkleTime) - 0.85);
                ctx.globalAlpha = whiteLayerAlpha < 0 ? 0 : whiteLayerAlpha;
                fpsRequests.push(20);
            }

            ctx.fillStyle = colorFromComponents(50, 50, 50, 0.8)
            ctx.fill();
            ctx.restore();
            // })
        }

        if (this.highlights.has(HighlightType.LIGHTEN)) { /* Clarear */
            ctx.save()

            ctx.fillStyle = colorFromComponents(255, 255, 255, 0.7)
            ctx.fill();

            ctx.restore();
        } else if (this.highlights.has(HighlightType.DARKEN)) { /* Escurecer */
            ctx.save()

            ctx.fillStyle = colorFromComponents(50, 50, 50, 0.5)
            ctx.fill();

            ctx.restore();
        }

        if (this.highlights.has(HighlightType.COLORED_BORDER)) { /* Borda colorida */
            ctx.save();

            // Configuramos a borda
            ctx.strokeStyle = colorFromComponents(0, 0, 255, 1)
            ctx.lineWidth = 8

            // Desenhamos a borda
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y,
                    this.radius + ctx.lineWidth / 2,
                    0, 2 * Math.PI);
            ctx.stroke();

            ctx.restore();
        }
        return fpsRequests;
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

    // Serialização
    serialize() {
        let serialized = this.serializationChain.call();
        serialized = serialized.join("");
        return serialized;
    }

    static deserialize(...arg) { return deserializeNode(...arg) };

    // Clona o nó a partir da instância atual
    clone() {
        return new this.constructor(this._args)
    }

    // Instancia a classe atual a partir de um nó existente
    static from(node) {
        return new this(node._args)
    }
}