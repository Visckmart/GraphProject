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

import Edge from "../../Edge.js";
import { deserializeAssignedValue, serializeAssignedValue } from "../../Serialization/EdgeSerialization.js";
import { HighlightType } from "../../../Utilities/Highlights.js";

let EdgeAssignedValueMixin = (superclass) => {
    // if (!(superclass instanceof Edge || superclass == Edge)) {
    //     return;
    // }

    class EdgeAssignedValue extends superclass {
        constructor({assignedValue, ...args} = {}) {
            super(args);
            this.assignedValue = assignedValue ?? Math.floor(Math.random()*100);

            this.textDrawChain.addLink(this.drawText);
        }

        static getMixins() {
            return super.getMixins().add(EdgeAssignedValueMixin)
        }

        _assignedValue;
        styledValue;
        set assignedValue(newValue) {
            let digits = Array.from(newValue.toString());

            /* Sublinhando caso só hajam os dígitos 6 e 9. */
            let filteredDigits = digits.filter(digit => digit != "6" && digit != "9");
            let newDigits = [];
            if (filteredDigits.length == 0) {
                for (let digit of digits) {
                    if      (digit == "6") { newDigits.push("6̲"); }
                    else if (digit == "9") { newDigits.push("9̲"); }
                    else { newDigits.push(digit) }
                }
                this.styledValue = newDigits.join("");
            } else {
                this.styledValue = digits.join("");
            }

            this._assignedValue = newValue;
        }
        get assignedValue() {
            return this._assignedValue;
        }

        get _args() {
            return {
                ...super._args,
                assignedValue: this.assignedValue
            }
        }

        getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd}) {
            // Calcula o meio da linha
            return [xStart + (xEnd - xStart)/2, yStart + (yEnd - yStart)/2, -10]
        }
        getTextAngle(x, y, {x: xStart, y: yStart}) {
            // Gira a label
            let angle = Math.atan2(y-yStart, x-xStart);
            // Não permite que o texto fique de cabeça para baixo
            if (Math.abs(angle) > Math.PI/2) {
                angle = Math.atan2(-(y-yStart), -(x-xStart))
            }
            return angle;
        }
        drawText = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled) => {
            let [midX, midY, yOff] = this.getTextPosition({x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled)
            ctx.save()
            ctx.translate(midX, midY);
            let angle = this.getTextAngle(midX, midY, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}, doubled);
            ctx.rotate(angle);

            // Levanta a label
            ctx.translate(0, yOff);

            ctx.font = "bold 15pt Arial";
            ctx.fillStyle = "#444";
            if (this.highlights.has(HighlightType.DISABLED)
            && this.highlights.length == 1) {
                ctx.fillStyle = "#999"
            }
            ctx.textAlign = "center";

            // TODO: Essa checagem deveria ser feita no assignment, não no draw
            ctx.fillText(this.styledValue, 0, 0);
            ctx.restore()
        }

        //region Serialização
        serialize() {
            let superSerialization = super.serialize();
            return superSerialization + serializeAssignedValue.bind(this)();
        }

        static deserialize(serializedEdge) {
            let rest = Edge.deserialize(serializedEdge, true);
            let assignedValueProperties = deserializeAssignedValue(rest);
            return new (EdgeAssignedValueMixin(superclass))({
                                ...assignedValueProperties
                            })
        }
        //endregion
    }

    return EdgeAssignedValue;
}

export default EdgeAssignedValueMixin;