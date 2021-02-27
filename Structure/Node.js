// Node Definition
import {backgroundGradient, nodeColorList} from "../Drawing/General.js";

import { HighlightType, HighlightsHandler } from "./Highlights.js"
import { generateNewRandomLabel, colorFromComponents } from "./Utilities.js";
import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";

import { deserializeNode, serializeNode } from "./NodeSerialization.js";

export const regularNodeRadius = 28;

let globalNodeIndex = 0

export default class Node {
    constructor({x, y, label, index = null, highlights = null}) {

        this._initialTime = index == null ? window.performance.now() : Math.random()*3000;
        this.index = index ?? globalNodeIndex;

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

        // Instanciando cadeia de responsabilidade
        this.textDrawChain = new ResponsibilityChain()
        // Adicionando procedure de draw
        this.textDrawChain.addLink(this.drawLabel)

        // Lista de mixins
        this.mixins = new Set()
    }

    // Lista de argumentos para clonagem
    get _args() {
        return {
            x: this.pos.x,
            y: this.pos.y,
            label: this.label,
            index: this.index,
            highlights: new Set(this.highlights.list())
        }
    }

    get color() {
        return "black"
    }

    lastRadiusCallTimestamp = 0;
    lastRadiusValue = 0;
    get radius() {
        let now = window.performance.now()
        if (now-this.lastRadiusCallTimestamp < 10) { return this.lastRadiusValue; }

        let elapsedTime = now - this._initialTime;
        let expansion = Math.sin(elapsedTime * Math.PI / (500 * 4)) * 1.5 - 2.5;
        // if (this.index == 0) { console.log(expansion) }

        this.lastRadiusCallTimestamp = now;
        this.lastRadiusValue = regularNodeRadius + expansion;

        return regularNodeRadius + expansion;
    }

    //region Drawing

    // Executa a cadeia de desenhos
    draw(...args) {
        let fpsRequests = this.drawChain.call(...args)
        fpsRequests = fpsRequests.filter(req => req !== undefined)
        return Math.max(...fpsRequests)
    }

    // Executa a cadeia de desenhos de texto
    drawText(...args) {
        this.textDrawChain.call(...args)
    }

    // This function draws one node. This includes the circle, the text and
    // the appropriate color (considering any animation happening).
    drawProcedure = (ctx) => {
        // Draw circle border
        ctx.save()
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);

        let hasHighlightWithBG = this.highlights.has(HighlightType.DARK_WITH_BLINK)
                                 || this.highlights.has(HighlightType.LIGHTEN)
                                 || this.highlights.has(HighlightType.DARKEN)
        if (!hasHighlightWithBG) {
            ctx.fillStyle = backgroundGradient;
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y,
                this.radius - ctx.lineWidth/2, 0, 2*Math.PI);

        // Draw highlights
        ctx.save();
        let fpsRequests = this._drawHighlights(ctx);
        ctx.restore();
        let maxFPSRequest = Math.max(...fpsRequests);

        // Draw label
        let transparentText = !this.highlights.has(HighlightType.LIGHTEN)
                               && this.highlights.has(HighlightType.DARKEN)
        //this._drawLabel(ctx, nodeLabeling, transparentText ? backgroundGradient : this.color)

        ctx.restore();

        return maxFPSRequest;
    }

    // HIGHLIGHTS

    _drawHighlights = (ctx) => {
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

            ctx.fillStyle = colorFromComponents(255, 255, 255, 0.8)
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
        } else if (this.highlights.has(HighlightType.COLORED_BORDER2)) { /* Borda colorida */
            ctx.save();

            // Configuramos a borda
            ctx.strokeStyle = colorFromComponents(80, 80, 80, 1)
            ctx.lineWidth = 5

            // Desenhamos a borda
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y,
                    this.radius - ctx.lineWidth,
                    0, 2 * Math.PI);
            ctx.stroke();

            ctx.restore();
        }
        return fpsRequests;
    }

    drawLabel = (ctx, nodeLabeling) => {
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = this.color;
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
    //endregion


    //region Serialização

    serialize() {
        return serializeNode.bind(this)();
    }

    static deserialize(...arg) { return deserializeNode(...arg) };

    //endregion

    // Clona o nó a partir da instância atual
    clone() {
        return new this.constructor(this._args);
    }

    // Instancia a classe atual a partir de um nó existente
    static from(node) {
        return new this(node._args);
    }

    toString() {
        return this.label
    }
}