import {HighlightType} from "../../Highlights.js";

let EdgeDirectedMixin = (superclass) => {
    return class EdgeDirected extends superclass {
        constructor(args) {
            super(args);

            this.mixins.add(EdgeDirectedMixin);
            this.drawChain.clearChain()
            this.drawChain.addLink(this.drawProcedure)
        }
        drawProcedure = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}) => {
            ctx.save()
            let t = window.performance.now()

            ctx.lineWidth = 8
            ctx.strokeStyle = "#aaa";
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = -t/150
            this.prepareLine(ctx, xStart, yStart, xEnd, yEnd)
            ctx.stroke();
            ctx.restore()

            for (let highlight of this.highlights.list()) {
                ctx.save()
                this._drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd);
                ctx.restore()
            }
        }
        prepareLine(ctx, xStart, yStart, xEnd, yEnd) {
            ctx.beginPath()
            ctx.moveTo(xStart, yStart);
            let mpx = (xEnd+xStart)/2
            let mpy = (yEnd+yStart)/2
            let theta = Math.atan2(yEnd - yStart, xEnd-xStart) - Math.PI / 2;
            let offset = 50;
            let c1x = mpx + offset * Math.cos(theta);
            let c1y = mpy + offset * Math.sin(theta);
            ctx.quadraticCurveTo(c1x, c1y, xEnd, yEnd);
        }
    }
}

export default EdgeDirectedMixin