/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Node Definition
import { globalNodeIndex } from "../Drawing/General.js";

import { HighlightType, HighlightsHandler } from "../Utilities/Highlights.js"
import { generateNewRandomLabel, colorFromComponents } from "../Utilities/Utilities.js";
import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";

import { deserializeNode, serializeNode } from "./Serialization/NodeSerialization.js";

export const regularNodeRadius = 28;
export default class Node {

    constructor({x, y, label, index = null, highlights = null, randomStart = false}) {

        this._initialTime = randomStart == false ? 0 : Math.random()*3000;
        this.index = index ?? globalNodeIndex;
        // if (index == null) {
        // }

        /* Posição */
        this.pos = {x: x, y: y};

        /* Informações de label */
        this.label = label ?? generateNewRandomLabel();

        /* Cadeia de desenho do nó */
        this.drawChain = new ResponsibilityChain()
        this.drawChain.addLink(this.drawProcedure)

        /* Cadeia de desenho de texto */
        this.textDrawChain = new ResponsibilityChain()
        this.textDrawChain.addLink(this.drawLabel)

        /* Destaques */
        this.highlights = new HighlightsHandler(highlights)
    }

    static getMixins() {
        return new Set()
    }
    /** Cor **/
    get color() {
        // Retorna um valor estático porque a coloração é feita pelo componente
        // de coloração (NodeColorMixin).
        return "black";
    }

    /** Raio **/
    /* Variáveis auxiliares para otimização */
    lastRadiusCallTimestamp = 0;
    lastRadiusValue = 0;
    get radius() {
        /* Retorna o valor armazenado se o tempo desde a última chamada foi curto */
        let now = window.performance.now();
        if (now-this.lastRadiusCallTimestamp < 10) { return this.lastRadiusValue; }

        /* Calcula o raio dado o tempo atual */
        let elapsedTime = now - this._initialTime;
        let expansion = Math.sin(elapsedTime * Math.PI / (500 * 4)) * 1.5 - 2.5;

        /* Atualiza os valores armazenados */
        this.lastRadiusCallTimestamp = now;
        this.lastRadiusValue = regularNodeRadius + expansion;

        /* Retorna o valor calculado */
        return regularNodeRadius + expansion;
    }

    //region Drawing

    /** Cadeias de desenhos **/
    draw(...args) {
        let fpsRequests = this.drawChain.call(...args)
        fpsRequests = fpsRequests.filter(req => req !== undefined)
        return Math.max(...fpsRequests)
    }
    drawText(...args) {
        this.textDrawChain.call(...args)
    }

    /** Desenho do nó **/
    drawProcedure = (ctx, background) => {
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
            ctx.fillStyle = background;
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fill();
        if (this.highlights.has(HighlightType.DISABLED)) {
            ctx.globalAlpha = 0.5;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y,
                this.radius - ctx.lineWidth/2, 0, 2*Math.PI);

        // Draw highlights
        ctx.save();
        let fpsRequests = this._drawHighlights(ctx);
        ctx.restore();
        let maxFPSRequest = Math.max(...fpsRequests);

        // Draw label
        // let transparentText = !this.highlights.has(HighlightType.LIGHTEN)
        //                        && this.highlights.has(HighlightType.DARKEN)
        //this._drawLabel(ctx, nodeLabeling, transparentText ? backgroundGradient : this.color)

        ctx.restore();

        return maxFPSRequest;
    }

    /** Desenho dos destaques **/
    _drawHighlights = (ctx) => {
        let fpsRequests = [0]
        // console.log(this.highlights.highlights)
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
            if (this.highlights.has(HighlightType.COLORED_A)) {
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

        if (this.highlights.has(HighlightType.COLORED_A)) { /* Borda colorida */
            ctx.save();

            // Configuramos a borda
            ctx.strokeStyle = "MediumSeaGreen";
            ctx.lineWidth = 4

            // Desenhamos a borda
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y,
                    this.radius + 4,
                    0, 2 * Math.PI);
            ctx.stroke();

            ctx.restore();
        } else if (this.highlights.has(HighlightType.COLORED_BORDER2)) { /* Borda colorida */
            ctx.save();

            ctx.lineWidth = 5

            // Configuramos a borda
            ctx.strokeStyle = "MediumSpringGreen";

            // Desenhamos a borda
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y,
                    this.radius + 5,
                    0, 2 * Math.PI);
            ctx.stroke();

            ctx.restore();
        } else if (this.highlights.has(HighlightType.ALGORITHM_VISITING)) {
            ctx.save();

            ctx.lineWidth = 5

            // Configuramos a borda
            ctx.strokeStyle = "blue";

            // Desenhamos a borda
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y,
                    this.radius + 5,
                    0, 2 * Math.PI);
            ctx.stroke();

            ctx.restore();
        }
        return fpsRequests;
    }

    /** Desenho da label **/
    drawLabel = (ctx, background, nodeLabeling) => {
        ctx.save()
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = this.highlights.has(HighlightType.DARKEN) ? background : this.color;
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
        if (this.highlights.has(HighlightType.DISABLED)) {
            ctx.globalAlpha = 0.5;
        }
        ctx.fillText(nodeText, this.pos.x, this.pos.y);
        ctx.globalAlpha = 1;
        ctx.restore()
    }
    //endregion


    //region Serialização

    serialize() {
        return serializeNode.bind(this)();
    }

    static deserialize(...arg) { return deserializeNode(...arg) };

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

    /** Clona o nó a partir da instância atual **/
    clone() {
        return new this.constructor(this._args);
    }

    /** Instancia a classe atual a partir de um nó existente **/
    static from(node) {
        return new this(node._args);
    }

    toString() {
        return this.label;
    }
    //endregion
}