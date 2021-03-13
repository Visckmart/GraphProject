let EdgeTemporaryMixin = (superclass) => {
    return class TemporaryEdge extends superclass {
        constructor(args) {
            super(args);

            this.drawChain.clearChain()
            this.drawChain.addBlockingLink(this.drawTemporaryEdge)

            this.mixins.add(EdgeTemporaryMixin)
        }

        drawTemporaryEdge = (ctx,
                             { x: xStart, y: yStart },
                             { x: xEnd, y: yEnd   }) => {
            ctx.save();
            ctx.lineWidth = 7;
            ctx.strokeStyle = "black";
            ctx.setLineDash([12, 8]);

            this.prepareLinePath(ctx, xStart, yStart, xEnd, yEnd)

            ctx.stroke();
            ctx.restore();
        }
    }
}

export default EdgeTemporaryMixin