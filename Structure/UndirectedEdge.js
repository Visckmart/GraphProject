import Edge from "./Edge.js";
import {ctx} from "../Drawing/General.js";

export class UndirectedEdge extends Edge {
    constructor(label) {
        super(label);
    }

    draw({ x: xStart, y: yStart },
         { x: xEnd,   y: yEnd   })
    {
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
}