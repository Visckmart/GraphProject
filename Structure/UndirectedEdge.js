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
        if(!this.isSelected) {
            ctx.save()
            ctx.lineWidth = 7
            ctx.strokeStyle = "#333";
            ctx.setLineDash([]);


            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            ctx.restore()
        }
        for(let highlight of this.highlights)
        {
            this._drawHighlight(highlight, xStart, yStart, xEnd, yEnd)
        }

        ctx.save();

        this._drawText({ x: xStart, y: yStart },
                       { x: xEnd,   y: yEnd   })
    }

    _drawHighlight(highlight, xStart, yStart, xEnd, yEnd) {
        switch(highlight) {
            case NodeHighlightType.SELECTION:
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
            case NodeHighlightType.ALGORITHM_FOCUS:
                ctx.save()
                ctx.lineWidth = 8
                ctx.strokeStyle = "#19ED79";
                ctx.setLineDash([]);

                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                ctx.lineTo(xEnd, yEnd);
                ctx.stroke();

                ctx.restore()
                ctx.save()
                ctx.lineWidth = 2
                ctx.strokeStyle = "#119E51";
                ctx.setLineDash([]);

                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                ctx.lineTo(xEnd, yEnd);
                ctx.stroke();

                ctx.restore()
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

    serialize() {
        let highlightNames = Object.entries(NodeHighlightType).map(entry => entry[1]).flat()
        this.highlights.delete(NodeHighlightType.SELECTION)
        let numberedHighlights = Array.from(this.highlights).map(h => highlightNames.indexOf(h)).filter(h => h != -1)
        return `${this.label}-${numberedHighlights}-`
    }

    static deserialize(string) {
        const re = /([a-zA-Z]+)-(.*)-/i;
        let found = string.match(re);
        if (found == undefined) {return;}
        const [_, label, highlights] = found;

        let edge = new UndirectedEdge(label)
        let highlightNames = Object.entries(NodeHighlightType).map(entry => entry[1]).flat()
        console.log("highlights", highlights.split(",").map(h => highlightNames[h]))
        edge.highlights = new Set(highlights.split(",").map(h => highlightNames[h]))
        return edge
    }
}