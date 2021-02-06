import { HighlightType, HighlightsHandler } from "./Highlights.js"
import {canvas, ctx} from "../Drawing/General.js";
import ResponsibilityChain from "./Mixins/ResponsabilityChain.js";

const transparentLabelGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
transparentLabelGradient.addColorStop(0, "#E5E0FF");
transparentLabelGradient.addColorStop(1, "#FFE0F3");
export default class Edge {
    constructor({ label, highlights = null }) {
        this.label = label
        this.highlights = new HighlightsHandler(highlights)

        // Instanciando cadeia de responsabilidade
        this.drawChain = new ResponsibilityChain()

        this.drawChain.addLink(this.drawProcedure)
    }

    get _args() {
        return {
            label: this.label,
            highlights: new Set(this.highlights.list())
        }
    }


    // Executa a cadeia de responsabilidade
    draw(...args) {
        this.drawChain.call(...args)
    }

    drawProcedure = ({ x: xStart, y: yStart },
         { x: xEnd,   y: yEnd   }) => {
        if(!this.isSelected) {
            ctx.save()
            ctx.lineWidth = 8
            ctx.strokeStyle = "#aaa";
            ctx.setLineDash([]);

            if (!(this.highlights.has(HighlightType.ALGORITHM_FOCUS) || this.highlights.has(HighlightType.ALGORITHM_FOCUS2) || this.highlights.has(HighlightType.ALGORITHM_VISITED))) {
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
            this._drawHighlight(highlight, xStart, yStart, xEnd, yEnd)
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
            case HighlightType.ALGORITHM_FOCUS:
                ctx.save()
                ctx.lineWidth = 9
                ctx.strokeStyle = "#777";
                ctx.setLineDash([]);

                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                ctx.lineTo(xEnd, yEnd);
                ctx.stroke();

                ctx.restore()
                // ctx.save()
                // ctx.lineWidth = 2
                // ctx.strokeStyle = "#119E51";
                // ctx.setLineDash([]);

                // ctx.beginPath()
                // ctx.moveTo(xStart, yStart);
                // ctx.lineTo(xEnd, yEnd);
                // ctx.stroke();

                // ctx.restore()
                break

            case HighlightType.ALGORITHM_FOCUS2:
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
            case HighlightType.ALGORITHM_VISITED:
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

            case HighlightType.ALGORITHM_RESULT:
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
                ctx.strokeStyle = transparentLabelGradient;
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

    // HIGHLIGHTS

    get isSelected() {
        return this.highlights.has(HighlightType.SELECTION);
    }

    serialize() {
        let serializedHighlights = this.highlights.prepareForSharing()
        if (serializedHighlights != "") {
            serializedHighlights = "-" + serializedHighlights
        }
        // console.log("s", serializedHighlights)
        return `${this.label}${serializedHighlights}`
    }

    static deserialize(serializedEdge) {
        const edgeDeserializationFormat = /([a-zA-Z0-9]+)-?(.*)?/i;
        let matchResult = serializedEdge.match(edgeDeserializationFormat);
        if (matchResult == undefined) {
            console.log("error deserializing", serializedEdge, matchResult)
            return;
        }
        // console.log(1)
        const [_, label, serializedHighlights] = matchResult;
        // console.log(label, serializedHighlights, serializedEdge)
        let highlights;
        if (serializedHighlights != null) {
            highlights = HighlightsHandler.deserialize(serializedHighlights)
            // console.log("d", highlights)
        }
        let edge = new Edge({ label, highlights })
        return edge
    }

    clone() {
        return new this.constructor(this._args)
    }

    static from(edge) {
        return new this(edge._args)
    }
}