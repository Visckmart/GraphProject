import {HighlightType} from "../../Highlights.js";

let EdgeDirectedMixin = (superclass) => {
    return class EdgeDirected extends superclass {
        constructor(args) {
            super(args);

            this.mixins.add(EdgeDirectedMixin);
            this.drawChain.clearChain()
            this.drawChain.addLink(this.drawProcedure)
        }

        prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled) {
            if (doubled) {
                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                let offset = 50;
                let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
                let cpX = ((xStart + xEnd) / 2) + Math.cos(theta) * offset;
                let cpY = ((yStart + yEnd) / 2) + Math.sin(theta) * offset;
                ctx.quadraticCurveTo(cpX, cpY, xEnd, yEnd);
            } else {
                super.prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled)
            }
        }
        getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled) {
            if (!doubled) return super.getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd})
            let offset = 20;
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
            if (theta > 0) {
                offset = 25;
            }
            let cpX = ((xStart + xEnd)/2) + Math.cos(theta) * offset;
            let cpY = ((yStart + yEnd)/2) + Math.sin(theta) * offset;
            return [cpX, cpY]
        }
        getTextAngle(x, y, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled) {
            if (!doubled) return super.getTextAngle(x, y, {x: xStart, y: yStart}, {x: xEnd, y: yEnd});
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart);
            // Não permite que o texto fique de cabeça para baixo
            if (Math.abs(theta) > Math.PI/2) {
                theta = Math.atan2(-(yEnd - yStart), -(xEnd - xStart))
            }
            return theta;
        }
        drawProcedure = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, timestamp, doubled) => {
            ctx.save()
            ctx.lineWidth = 8;
            ctx.strokeStyle = "#777";
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = -timestamp/350;
            this.prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled)
            ctx.stroke();
            ctx.restore()

            for (let highlight of this.highlights.list()) {
                ctx.save()
                this._drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd);
                ctx.restore()
            }
        }
        _drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd) {
            if (this.highlights.has(HighlightType.SELECTION)) {
                ctx.save()

                ctx.setLineDash([8, 4]);
                ctx.lineWidth = 8
                ctx.lineDashOffset = -window.performance.now()/350;
                ctx.strokeStyle = "blue";
                this.prepareLine(ctx, xStart, yStart, xEnd, yEnd)
                ctx.stroke();

                ctx.restore()
            } else {
                super._drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd)
            }
        }
    }
}

export default EdgeDirectedMixin