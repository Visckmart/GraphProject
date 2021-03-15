import {HighlightType} from "../../Highlights.js";
import { pointFromCircleAngle } from "../../../Drawing/GeometryHelper.js";

let EdgeDirectedMixin = (superclass) => {
    return class EdgeDirected extends superclass {
        constructor(args) {
            super(args);

            this.mixins.add(EdgeDirectedMixin);
            this.drawChain.clearChain()
            this.drawChain.addLink(this.drawProcedure)
        }

        // TODO: Organizar
        prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled) {
            // doubled = true;
            let arrowStartX;
            let arrowStartY;
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
            let newp = pointFromCircleAngle(
                {x:xEnd, y:yEnd},
                30, theta - Math.PI/2)
            if (doubled) {
                ctx.beginPath()
                ctx.moveTo(xStart, yStart);
                let offset = 50;
                let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
                let cpX = ((xStart + xEnd) / 2) + Math.cos(theta) * offset;
                let cpY = ((yStart + yEnd) / 2) + Math.sin(theta) * offset;
                arrowStartX = cpX
                arrowStartY = cpY
                let newp2 = pointFromCircleAngle(
                    {x:xEnd, y:yEnd},
                    30, Math.atan2(cpX - cpY, xEnd - xStart) - Math.PI / 2)
                ctx.quadraticCurveTo(cpX, cpY, newp.x, newp.y);
            } else {
                super.prepareLinePath(ctx, xStart, yStart, xEnd, yEnd, doubled)
                arrowStartX = xStart;
                arrowStartY = yStart;
            }
            let arrowAngle = Math.atan2(arrowStartX - xEnd, arrowStartY - yEnd) + Math.PI;

            let arrowHeadSize = 25
            ctx.moveTo(newp.x - (arrowHeadSize * Math.sin(arrowAngle - Math.PI / 6.5)),
                       newp.y - (arrowHeadSize * Math.cos(arrowAngle - Math.PI / 6.5)));

            ctx.lineTo(newp.x, newp.y);

            ctx.moveTo(newp.x - (arrowHeadSize * Math.sin(arrowAngle + Math.PI / 6.5)),
                       newp.y - (arrowHeadSize * Math.cos(arrowAngle + Math.PI / 6.5)));

            ctx.lineTo(newp.x, newp.y);

        }
        getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled) {
            if (!doubled) return super.getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd})
            let offset = 45;
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
            // if (theta > Math.PI/2) {
            //     offset = 1000;
            // }
            let cpX = ((xStart + xEnd)/2) + Math.cos(theta) * offset;
            let cpY = ((yStart + yEnd)/2) + Math.sin(theta) * offset;
            return [cpX, cpY, 7.5]
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

        get width() {
            return 7;
        }
        get color() {
            let c = super.color
            if (this.highlights.has(HighlightType.DISABLED) || c != "#aaa") {
                return c
            } else {
                return "#444"
            }
        }
        drawProcedure = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, timestamp, doubled) => {
            ctx.save()
            this.prepareStyle(ctx)
            this.prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled)

            ctx.stroke();

            ctx.restore()


        }
        _drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd, doubled) {
            if (this.highlights.has(HighlightType.SELECTION)) {
                ctx.save()

                ctx.setLineDash([10, 7]);
                ctx.lineWidth = 7
                ctx.lineDashOffset = -window.performance.now()/200;
                ctx.strokeStyle = "#3344FF";
                this.prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled)
                ctx.stroke();

                ctx.restore()
            } else {
                // super._drawHighlight(ctx, highlight, xStart, yStart, xEnd, yEnd, this.prepareLine, doubled)
            }
        }
        serialize() {
            // A informação de ser direcionada vai pelo grafo
            return super.serialize();
        }

        static deserialize(serializedEdge) {
            let x = superclass.deserialize(serializedEdge);
            return new (EdgeDirectedMixin(superclass))({...x._args});
        }
    }
}

export default EdgeDirectedMixin