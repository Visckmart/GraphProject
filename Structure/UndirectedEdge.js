import Edge from "./Edge.js";
import { NodeHighlightType } from "../Structure/Node.js"
import {canvas, ctx} from "../Drawing/General.js";

export class UndirectedEdge extends Edge {
    constructor(label) {
        super(label);
        this.highlights = new Set()
    }

    draw({ x: xStart, y: yStart },
         { x: xEnd,   y: yEnd   }) {
        ctx.save()
        ctx.lineWidth = 7
        ctx.strokeStyle = "#333";
        ctx.setLineDash([]);

        if (this.isSelected) {
            ctx.setLineDash([15, 15]);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 5
            ctx.lineDashOffset = window.performance.now()/50
        }

        ctx.beginPath()
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();

        ctx.restore()


        ctx.save();

        this._drawText({ x: xStart, y: yStart },
                       { x: xEnd,   y: yEnd   })
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
        
        ctx.restore();
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

}