import {HighlightType} from "../../Highlights.js";

let EdgeDirectedMixin = (superclass) => {
    return class EdgeDirected extends superclass {
        constructor(args) {
            super(args);

            this.mixins.add(EdgeDirectedMixin);
            this.drawChain.clearChain()
            this.drawChain.addLink(this.drawProcedure)
        }

        prepareLine(ctx, xStart, yStart, xEnd, yEnd, t) {
            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            let offset = 50;
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
            let cpX = ((xStart + xEnd)/2) + Math.cos(theta) * offset;
            let cpY = ((yStart + yEnd)/2) + Math.sin(theta) * offset;
            ctx.quadraticCurveTo(cpX, cpY, xEnd, yEnd);
        }

        drawProcedure = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, timestamp) => {
            ctx.save()
            ctx.lineWidth = 8;
            ctx.strokeStyle = "#aaa";
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = -timestamp/200;
            this.prepareLine(ctx, xStart, yStart, xEnd, yEnd, timestamp)
            ctx.stroke();
            ctx.restore()

            for (let highlight of this.highlights.list()) {
                ctx.save()
                this._drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd);
                ctx.restore()
            }
        }
    }
}

export default EdgeDirectedMixin