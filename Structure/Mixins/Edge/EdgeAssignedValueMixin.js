import Edge from "../../Edge.js";
import { deserializeAssignedValue, serializeAssignedValue } from "../../EdgeSerialization.js";
import { HighlightType } from "../../Highlights.js";

let EdgeAssignedValueMixin = (superclass) => {
    // if (!(superclass instanceof Edge || superclass == Edge)) {
    //     return;
    // }

    class EdgeAssignedValue extends superclass {
        constructor({assignedValue, ...args} = {}) {
            super(args);
            this.assignedValue = assignedValue ?? Math.floor(Math.random()*100);

            this.textDrawChain.addLink(this.drawText);

            this.mixins.add(EdgeAssignedValueMixin);
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
            let text = this.assignedValue.toString()
            if      (this.assignedValue == 6) { text = "6̲"; }
            else if (this.assignedValue == 9) { text = "9̲"; }
            ctx.fillText(text, 0, 0);
            ctx.restore()
        }

        //region Serialização
        serialize() {
            let superSerialization = super.serialize();
            return superSerialization + serializeAssignedValue.bind(this)();
        }

        static deserialize(serializedEdge) {
            let [superProperties, rest] = Edge.deserialize(serializedEdge, true);
            let ab = superclass.deserialize(rest);
            let assignedValueProperties = deserializeAssignedValue(rest);
            return new (EdgeAssignedValueMixin(superclass))({
                                ...superProperties,
                                ...ab._args,
                                ...assignedValueProperties
                            })
        }
        //endregion
    }

    return EdgeAssignedValue;
}

export default EdgeAssignedValueMixin;