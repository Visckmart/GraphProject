/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {HighlightType} from "../../../Utilities/Highlights.js";
import { pointFromCircleAngle } from "../../../Drawing/GeometryHelper.js";
import { getDistanceOf } from "../../../Utilities/Utilities.js";

let EdgeDirectedMixin = (superclass) => {
    return class EdgeDirected extends superclass {
        constructor(args) {
            super(args);

            this.drawChain.clearChain()
            this.drawChain.addLink(this.drawProcedure)
        }

        static getMixins() {
            return super.getMixins().add(EdgeDirectedMixin)
        }

        prepareLine(ctx, xStart, yStart, xEnd, yEnd, doubled) {
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
            // Recalcular o ponto final da aresta uma vez que ele deve estar na
            // borda do nó e não no centro do nó
            let endPoint = pointFromCircleAngle({x: xEnd, y: yEnd},
                                                30, theta - Math.PI/2);

            // Preparar o desenho da aresta, seja curvada ou reta
            let arrowAngleAuxPoint = {x: xStart, y: yStart};
            if (doubled) {
                ctx.beginPath()
                ctx.moveTo(xStart, yStart);

                let offset = 50;
                let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
                let centerPoint = {x: ((xStart + xEnd) / 2) + Math.cos(theta) * offset,
                                   y: ((yStart + yEnd) / 2) + Math.sin(theta) * offset };

                arrowAngleAuxPoint = centerPoint;

                ctx.quadraticCurveTo(centerPoint.x, centerPoint.y,
                                     endPoint.x, endPoint.y);
            } else {
                super.prepareLinePath(ctx, xStart, yStart, xEnd, yEnd, doubled)
            }

            // Desenhar a ponta da seta
            let arrowAngle = Math.atan2(arrowAngleAuxPoint.x - xEnd, arrowAngleAuxPoint.y - yEnd) + Math.PI;
            let arrowHeadSize = 25;

            let headAngle = arrowAngle - Math.PI / 5;
            ctx.moveTo(endPoint.x - (arrowHeadSize * Math.sin(headAngle)),
                       endPoint.y - (arrowHeadSize * Math.cos(headAngle)));

            ctx.lineTo(endPoint.x, endPoint.y);

            if (doubled) {
                headAngle = arrowAngle + Math.PI / 8;
            } else {
                headAngle = arrowAngle + Math.PI / 5;
            }
            ctx.moveTo(endPoint.x - (arrowHeadSize * Math.sin(headAngle)),
                       endPoint.y - (arrowHeadSize * Math.cos(headAngle)));

            ctx.lineTo(endPoint.x, endPoint.y);

        }
        getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled) {
            if (!doubled) return super.getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd})
            let offset = 40;
            let theta = Math.atan2(yEnd - yStart, xEnd - xStart) - Math.PI / 2;
            // if (theta > Math.PI/2) {
            //     offset = 1000;
            // }
            let cpX = ((xStart + xEnd)/2) + Math.cos(theta) * offset;
            let cpY = ((yStart + yEnd)/2) + Math.sin(theta) * offset;
            return [cpX, cpY, 7.5]
        }
        getTextAngle(x, y, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled) {
            if (doubled == false) {
                return super.getTextAngle(x, y, {x: xStart, y: yStart}, {x: xEnd, y: yEnd});
            }
            let deltaX = xEnd - xStart;
            let deltaY = yEnd - yStart;
            let theta = Math.atan2(deltaY, deltaX);
            // Não permite que o texto fique de cabeça para baixo
            if (Math.abs(theta) > Math.PI/2) {
                theta = Math.atan2(-deltaY, -deltaX)
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