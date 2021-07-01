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
import Node from "../../Node.js";
import {nodeColorList} from "../../../Drawing/General.js";
import {deserializeAssignedValue, serializeAssignedValue} from "../../Serialization/EdgeSerialization.js";
import {deserializeColor, serializeColor} from "../../Serialization/NodeSerialization.js";

let colorRotation = 0

let NodeColorMixin = (superclass) => {
    class NodeColor extends superclass {
        constructor({color = null, colorIndex = null, ...args}) {
            super(args)

            if (colorIndex) {
                this._color = nodeColorList[colorIndex % nodeColorList.length];
            } else if (color) {
                this._color = color;
            } else {
                this._color = nodeColorList[colorRotation++ % nodeColorList.length];
            }
        }

        static getMixins() {
            return super.getMixins().add(NodeColorMixin)
        }

        get color() {
            return this._color;
        }

        set color(newColor) {
            this._color = newColor;
        }
        get _args() {
            return {
                ...super._args,
                color: this.color
            }
        }
        serialize() {
            let superSerialization = super.serialize();
            return superSerialization + serializeColor.bind(this)();
        }

        static deserialize(serializedNode) {
            let [superProperties, rest] = superclass.deserialize(serializedNode, true);
            let colorProperties = deserializeColor(rest);
            return new (NodeColorMixin(Node))({
                                             ...superProperties,
                                             ...colorProperties
                                         })
        }
    }
    return NodeColor;
}

export default NodeColorMixin;