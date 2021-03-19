import {colorFromComponents} from "../../Utilities.js";
import Node from "../../Node.js";
import {nodeColorList} from "../../../Drawing/General.js";
import {deserializeAssignedValue, serializeAssignedValue} from "../../EdgeSerialization.js";
import {deserializeColor, serializeColor} from "../../NodeSerialization.js";

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