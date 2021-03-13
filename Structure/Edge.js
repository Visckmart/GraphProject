import { serializeEdge, deserializeEdge } from "./EdgeSerialization.js";

import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";
import { generateNewRandomLabel } from "./Utilities.js";
import { HighlightType, HighlightsHandler } from "./Highlights.js"
import { backgroundGradient } from "../Drawing/General.js";

let globalEdgeIndex = 0
export default class Edge {

    constructor({ index = null, label, highlights = null } = {}) {
        this._initialTime = window.performance.now();
        this.label = label ?? generateNewRandomLabel();
        this.highlights = new HighlightsHandler(highlights);

        this.index = index ?? globalEdgeIndex
        globalEdgeIndex = Math.max(globalEdgeIndex, index ?? globalEdgeIndex)+1;

        // Lista de mixins
        this.mixins = new Set()

        // Instanciando cadeias de responsabilidade
        if (!this.drawChain) {
        this.drawChain = new ResponsibilityChain();}
        this.drawChain.addLink(this.drawProcedure);

        // Instanciando cadeias de responsabilidade
        this.textDrawChain = new ResponsibilityChain();
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
        // if (!this.isSelected) {
            ctx.save()
            this.prepareStyle(ctx)

            // if (!(this.highlights.has(HighlightType.DARK_WITH_BLINK) || this.highlights.has(HighlightType.LIGHTEN) || this.highlights.has(HighlightType.DARKEN))) {


                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                ctx.lineTo(xEnd, yEnd);
                ctx.stroke();
            // }
            ctx.restore()
        // }

        // for (let highlight of this.highlights.list()) {
        //     ctx.save()
        //     this._drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd);
        //     ctx.restore()
        // }
    }

    prepareStyle(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.setLineDash([]);
        if (this.highlights.has(HighlightType.SELECTION)) {
            ctx.setLineDash([12, 8]);
            ctx.lineDashOffset = (window.performance.now() - this._initialTime) / 75
        } else if (this.highlights.has(HighlightType.DISABLED)) {
            ctx.setLineDash([10, 5]);
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
        return "#aaa";
    }
    get width() {
        if      (this.highlights.has(HighlightType.DISABLED))  { return 5 }
        else if (this.highlights.has(HighlightType.LIGHTEN))   { return 8 }
        else if (this.highlights.has(HighlightType.COLORED_A)) { return 9 }
        return 7;
    }
    // TODO: Transformar em ifs como nos highlights dos nós
    _drawHighlight (ctx, highlight, xStart, yStart, xEnd, yEnd, z, d) {
        let prepareLine = z ?? this.prepareLinePath
        // if (this.highlights.has(HighlightType.SELECTION)) {
            // ctx.save()

            // ctx.setLineDash([12, 8]);
            // ctx.strokeStyle = "blue";
            // ctx.lineWidth = 7
            // ctx.lineDashOffset = (window.performance.now() - this._initialTime) / 75
            // prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
            // ctx.stroke();

            // ctx.restore()
        // }

        // if (this.highlights.has(HighlightType.DARK_WITH_BLINK)) {
        //     ctx.save()
        //     ctx.lineWidth = 9
        //     ctx.strokeStyle = "#777";
        //     ctx.setLineDash([]);
        //
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //
        //     ctx.restore()
        // }
        // if (this.highlights.has(HighlightType.LIGHTEN)) {
        //     ctx.save()
        //     ctx.lineWidth = 9
        //     ctx.strokeStyle = "#266EFF";
        //     ctx.setLineDash([]);
        //
        //
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //
        //     ctx.restore()
        // } else if (this.highlights.has(HighlightType.DARKEN)) {
        //     ctx.save()
        //     ctx.lineWidth = 9
        //     ctx.strokeStyle = "#999";
        //     ctx.setLineDash([]);
        //
        //
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //
        //     ctx.restore()
        // }
        // if (this.highlights.has(HighlightType.ALGORITHM_VISITING)) {
        //     ctx.save()
        //     ctx.lineWidth = 9
        //     ctx.strokeStyle = "#777";
        //     ctx.setLineDash([]);
        //
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //
        //     ctx.restore()
        // }
        // if (this.highlights.has(HighlightType.COLORED_A)) {
        //     ctx.save()
        //     ctx.lineWidth = 9
        //     ctx.strokeStyle = "#00E900";
        //     ctx.setLineDash([]);
        //
        //
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //
        //     ctx.restore()
        // }
        // if (this.highlights.has(HighlightType.DISABLED)) {
        //     ctx.save()
        //     ctx.lineWidth = 7
        //     ctx.strokeStyle = "#777";
        //     ctx.setLineDash([15, 10]);
        //
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //
        //     ctx.restore()
        // }
        // if (this.highlights.has(HighlightType.FEATURE_PREVIEW)) {
        //     ctx.save()
        //
        //     ctx.setLineDash([]);
        //     ctx.strokeStyle = backgroundGradient;
        //     ctx.lineWidth = 9
        //     prepareLine(ctx, xStart, yStart, xEnd, yEnd, d)
        //
        //     ctx.stroke();
        //     ctx.lineWidth = 7
        //     // ctx.setLineDash([8,8]);
        //     ctx.strokeStyle = "#FF8080";
        //     ctx.stroke();
        //
        //     ctx.restore()
        // }
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