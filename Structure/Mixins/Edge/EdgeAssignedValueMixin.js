import Edge from "../../Edge.js";
import { deserializeAssignedValue, serializeAssignedValue } from "../../EdgeSerialization.js";
import { HighlightType } from "../../Highlights.js";

let EdgeAssignedValueMixin = (superclass) => {
    if (!(superclass instanceof Edge || superclass == Edge)) {
        return;
    }

    class EdgeAssignedValue extends superclass {
        constructor({assignedValue, ...args} = {}) {
            super(args);
            this.assignedValue = assignedValue ?? Math.floor(Math.random()*100);

            this.drawChain.addLink(this.drawText);

            this.mixins.add(EdgeAssignedValueMixin);
        }

        get _args() {
            return {
                ...super._args,
                assignedValue: this.assignedValue
            }
        }

        drawText = (ctx, {x: xStart, y: yStart}, {x: xEnd, y: yEnd}) => {
            // Calcula o meio da linha
            let midX = (xEnd - xStart)/2
            let midY = (yEnd - yStart)/2

            ctx.save()
            ctx.translate(xStart + midX,
                          yStart + midY);

            // Gira a label
            let angle = Math.atan2(midY, midX);
            // Não permite que o texto fique de cabeça para baixo
            if (Math.abs(angle) > Math.PI/2) {
                angle = Math.atan2(-midY, -midX)
            }
            ctx.rotate(angle);

            // Levanta a label
            ctx.translate(0, -15);

            ctx.font = "bold 15pt Arial";
            ctx.fillStyle = "#444";
            if (this.highlights.has(HighlightType.ALGORITHM_NOTVISITED)
            && this.highlights.length == 1) {
                ctx.fillStyle = "#999"
            }
            ctx.textAlign = "center";

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
            let [superProperties, rest] = superclass.deserialize(serializedEdge, true);
            let assignedValueProperties = deserializeAssignedValue(rest);
            return new EdgeAssignedValue({
                                ...superProperties,
                                ...assignedValueProperties
                            })
        }
        //endregion
    }

    return EdgeAssignedValue;
}

export default EdgeAssignedValueMixin;