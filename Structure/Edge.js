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

import { serializeEdge, deserializeEdge } from "./Serialization/EdgeSerialization.js";

import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";
import { generateNewRandomLabel } from "../Utilities/Utilities.js";
import { HighlightType, HighlightsHandler } from "../Utilities/Highlights.js";

let globalEdgeIndex = 0
export default class Edge {

    constructor({ index = null, label = null, highlights = null } = {}) {
        this._initialTime = window.performance.now();
        this.label = label ?? generateNewRandomLabel();
        this.highlights = new HighlightsHandler(highlights);

        this.index = index ?? globalEdgeIndex
        globalEdgeIndex = Math.max(globalEdgeIndex, index ?? globalEdgeIndex)+1;

        // Instanciando cadeias de responsabilidade
        if (!this.drawChain) {
        this.drawChain = new ResponsibilityChain();}
        this.drawChain.addLink(this.drawProcedure);

        // Instanciando cadeias de responsabilidade
        this.textDrawChain = new ResponsibilityChain();
    }

    static getMixins() {
        return new Set()
    }

    get _args() {
        return {
            label: this.label,
            highlights: new Set(this.highlights.list()),
            index: this.index
        }
    }

    //region Desenho do Nó

    // Executa a cadeia de responsabilidade
    draw(...args) { this.drawChain.call(...args) }

    drawProcedure = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}) => {
        ctx.save()
        this.prepareStyle(ctx)
        ctx.beginPath()
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore()
    }

    prepareStyle(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        if (this.highlights.has(HighlightType.SELECTION)) {
            ctx.setLineDash([12, 8]);
            ctx.lineDashOffset = -(window.performance.now() - this._initialTime) / 75
        } else if (this.highlights.has(HighlightType.DISABLED)) {
            ctx.setLineDash([10, 5]);
        } else {
            ctx.lineCap = "round";
        }

    }
    prepareLinePath(ctx, xStart, yStart, xEnd, yEnd) {
        ctx.beginPath()
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
    }
    get color() {
        if (this.highlights.has(HighlightType.SELECTION)) {
            return "blue";
        } else if (this.highlights.has(HighlightType.COLORED_A)) {
            return "#00E900";
        } else if (this.highlights.has(HighlightType.FEATURE_PREVIEW)) {
            return "#FF8080";
        } else if (this.highlights.has(HighlightType.LIGHTEN)) {
            return "#266EFF";
        } else if (this.highlights.has(HighlightType.DARKEN)) {
            return "#777";
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return "#DFDFDF";
        }
        return "#aaa";
    }
    get width() {
        if      (this.highlights.has(HighlightType.DISABLED))  { return 5 }
        else if (this.highlights.has(HighlightType.LIGHTEN))   { return 8 }
        else if (this.highlights.has(HighlightType.COLORED_A)) { return 9 }
        return 8;
    }
    //endregion

    get isSelected() {
        return this.highlights.has(HighlightType.SELECTION);
    }

    //region Serialização

    serialize() { return serializeEdge.bind(this)(); }
    static deserialize(...arg) { return deserializeEdge(...arg) };

    //endregion

    clone() {
        return new this.constructor(this._args)
    }

    static from(edge) {
        return new this(edge._args)
    }


}