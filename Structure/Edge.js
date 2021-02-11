import { HighlightType, HighlightsHandler } from "./Highlights.js"
import { ctx } from "../Drawing/General.js";
import { backgroundGradient } from "./Utilities.js";
import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";
import { deserializeEdge } from "./EdgeSerialization.js";
// import {serializeAssignedValueEdge} from "./Mixins/Edge/EdgeAssignedValueMixin.js";

export default class Edge {
    constructor({ label, highlights = null } = {}) {
        this.label = label ?? String.fromCharCode(Math.floor(Math.random()*26)+65);
        this.highlights = new HighlightsHandler(highlights);

        // Instanciando cadeia de responsabilidade
        this.drawChain = new ResponsibilityChain()
        this.drawChain.addLink(this.drawProcedure)
        this.draw = this.drawChain.call.bind(this.drawChain)

        this.serializationChain = new ResponsibilityChain();
        this.serializationChain.addLink(this.serializeEdge.bind(this));
    }

    get _args() {
        return {
            label: this.label,
            highlights: new Set(this.highlights.list())
        }
    }

    // Executa a cadeia de responsabilidade
    // draw(...args) { this.drawChain.call(...args) }

    drawProcedure = ({ x: xStart, y: yStart },
         { x: xEnd,   y: yEnd   }) => {
        // ctx.globalAlpha = 0.8
        if(!this.isSelected) {
            ctx.save()
            ctx.lineWidth = 8
            ctx.strokeStyle = "#aaa";
            ctx.setLineDash([]);

            if (!(this.highlights.has(HighlightType.DARK_WITH_BLINK) || this.highlights.has(HighlightType.LIGHTEN) || this.highlights.has(HighlightType.DARKEN))) {
                if (this.highlights.has(HighlightType.ALGORITHM_NOTVISITED)) {
                    // ctx.lineWidth = nodeBorderWidth/2;
                    ctx.setLineDash([10, 5]);
                    ctx.lineWidth = 5
                } else {
                    // ctx.lineWidth = nodeBorderWidth;
                    ctx.setLineDash([]);
                }

                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                ctx.lineTo(xEnd, yEnd);
                ctx.stroke();
            }
            ctx.restore()
        }
        for(let highlight of this.highlights.list()) {
            ctx.save()
            // ctx.globalAlpha = 0.5
            this._drawHighlight(highlight, xStart, yStart, xEnd, yEnd)
            ctx.restore()
        }

        ctx.save();

        // this._drawText({ x: xStart, y: yStart },
        //                { x: xEnd,   y: yEnd   })
        
        ctx.restore();
    }

    _drawHighlight(highlight, xStart, yStart, xEnd, yEnd) {
        switch(highlight) {
        case HighlightType.SELECTION:
            ctx.save()

            ctx.setLineDash([15, 15]);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 5
            ctx.lineDashOffset = window.performance.now()/50
            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
            break
        case HighlightType.DARK_WITH_BLINK:
            ctx.save()
            ctx.lineWidth = 9
            ctx.strokeStyle = "#777";
            ctx.setLineDash([]);

            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
            break

        case HighlightType.LIGHTEN:
            ctx.save()
            ctx.lineWidth = 9
            ctx.strokeStyle = "#528FFF";
            ctx.setLineDash([]);


            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
            break

        case HighlightType.ALGORITHM_VISITING:
            ctx.save()
            ctx.lineWidth = 9
            ctx.strokeStyle = "#777";
            ctx.setLineDash([]);

            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
            break;
        case HighlightType.DARKEN:
            ctx.save()
            ctx.lineWidth = 9
            ctx.strokeStyle = "#bbb";
            ctx.setLineDash([]);


            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
            break

        case HighlightType.COLORED_BORDER:
            ctx.save()
            ctx.lineWidth = 9
            ctx.strokeStyle = "blue";
            ctx.setLineDash([]);


            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
            break
        case HighlightType.FEATURE_PREVIEW:
            ctx.save()

            ctx.setLineDash([]);
            ctx.strokeStyle = backgroundGradient;
            ctx.lineWidth = 9
            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
            ctx.lineWidth = 7
            // ctx.setLineDash([8,8]);
            ctx.strokeStyle = "#FF8080";
            ctx.stroke();

            ctx.restore()
            break
        }
    }

    get isSelected() {
        return this.highlights.has(HighlightType.SELECTION);
    }
    // cc = 0;
    // Serialização
    serialize() {
        // console.log(2)
        // console.trace()
        // this.cc++;
        // if (this.cc > 10) {
        //     return;
        // }
        // let serializedEdge = this.label;
        // for (let x of this.serializationChain) {
        //     console.log(x)
        // }
        // // let serialization = serializedEdge + serializeAssignedValueEdge();
        // return serialization;
        let serialized = this.serializationChain.call()
        // console.log(serialized)
        serialized = serialized.join("")
        // console.log("zz", zz)
        return serialized
    }
    serializeEdge() {
        return this.label;
    }

    static deserialize = deserializeEdge;

    clone() {
        return new this.constructor(this._args)
    }

    static from(edge) {
        return new this(edge._args)
    }
}