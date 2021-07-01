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

let EdgeTemporaryMixin = (superclass) => {
    return class TemporaryEdge extends superclass {
        constructor(args) {
            super(args);

            this.drawChain.clearChain()
            this.drawChain.addBlockingLink(this.drawTemporaryEdge)
        }

        static getMixins() {
            return super.getMixins().add(EdgeTemporaryMixin)
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