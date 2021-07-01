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

import {colorFromComponents} from "../../../Utilities/Utilities.js";

function roundRect(ctx, x, y, width, height, radius) {
    let r = x + width;
    let b = y + height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + height - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

let NodeAssignedValueMixin = (superclass) => {
    return class NodeAssignedValue extends  superclass {
        constructor({assignedValue = '', ...args}) {
            super(args)
            this.assignedValue = assignedValue

            this.textDrawChain.addLink(this.drawAuxLabel)
        }

        static getMixins() {
            return super.getMixins().add(NodeAssignedValueMixin)
        }

        get _args() {
            return {
                ...super._args,
                assignedValue: this.assignedValue
            }
        }

        drawAuxLabel = (ctx) => {
            if(!this.assignedValue || this.assignedValue == "") { return; }
            ctx.save();

            if (this.assignedValue == "∞") {
                ctx.font = "bold 20pt Arial";
            } else {
                ctx.font = "bold 17pt Arial";
            }
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';

            let boxWidth = ctx.measureText(this.assignedValue).width + 5;
            let boxHeight = 25;
            let boxVerticalOffset = 45;

            ctx.beginPath();
            roundRect(ctx,
                this.pos.x - boxWidth/2,
                this.pos.y - boxHeight/2 - boxVerticalOffset,
                boxWidth, boxHeight, 5);

            if (this.assignedValue == "∞") {
                ctx.fillStyle = colorFromComponents(180, 180, 180, 0.5);
                ctx.fill();

                // Text color
                ctx.fillStyle = "#888";
            } else {
                ctx.fillStyle = this.color;
                ctx.fill();

                // Text color
                ctx.fillStyle = "white";
            }
            ctx.fillText(this.assignedValue,
                         this.pos.x, this.pos.y - boxVerticalOffset);

            ctx.restore()
            return 0;
        }
    }
}

export default NodeAssignedValueMixin
/*

let NodeAssignedValue = NodeAssignedValueMixin(Node)

let nodeSoValue = new NodeAssignedValue({x: 100, y: 200, label: 'label', assignedValue: 'Olá'})

console.log(nodeSoValue)
*/