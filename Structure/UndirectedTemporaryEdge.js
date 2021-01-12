import Edge from "./Edge.js";
import {ctx} from "../Drawing/General.js";

export class UndirectedTemporaryEdge extends Edge {
    draw({ x: xStart, y: yStart },
         { x: xEnd,   y: yEnd   })
    {
        ctx.save()
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.setLineDash([10, 5]);

        ctx.beginPath()
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();

        ctx.restore()
    }
}