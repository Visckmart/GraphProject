import {ctx} from "../../../Drawing/General.js";

let TemporaryEdgeMixin = (superclass) => {
    return class TemporaryEdge extends  superclass {
        constructor(...args) {
            super(...args);

            this.drawChain.clearChain()
            this.drawChain.addBlockingLink(this.drawTemporaryEdge)
        }

        drawTemporaryEdge = ({ x: xStart, y: yStart },
             { x: xEnd,   y: yEnd   }) => {
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
}


export default TemporaryEdgeMixin