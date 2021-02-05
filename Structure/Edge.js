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

    _drawText({ x: xStart, y: yStart },
              { x: xEnd,   y: yEnd   }) {
        
        // yEnd -= vertOffset
        // yStart -= vertOffset
        // Calcula o meio da linha
        let midX = (xEnd - xStart)/2
        let midY = (yEnd - yStart)/2

        ctx.translate(xStart + midX, yStart + midY);

        // Calcula o ângulo do texto
        let angle = Math.atan2(midY, midX)
        // Não permite que o texto fique de cabeça para baixo
        if (Math.abs(angle) > Math.PI/2) {
            angle = Math.atan2(-midY, -midX)
        }
        ctx.rotate(angle);
        
        // Deslocamento vertical faz com que o texto não seja desenhado
        // por cima da linha
        let vertOffset = 15
        ctx.translate(0, -vertOffset);

        ctx.font = "bold 15pt Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.label, 0, 0);
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
        return new Edge({ label: this.label, highlights: new Set(this.highlights.list()) })
    }

    static from(edge) {
        return new this(edge._args)
    }
}