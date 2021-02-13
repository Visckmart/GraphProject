import { ctx } from "../../../Drawing/General.js";
import Edge from "../../Edge.js";
import { deserializeAssignedValue, serializeAssignedValue } from "../../EdgeSerialization.js";

let EdgeAssignedValueMixin = (superclass) => {
    if (!(superclass instanceof Edge || superclass == Edge)) {
        return;
    }

    class EdgeAssignedValue extends superclass {
        constructor({assignedValue, ...args} = {}) {
            super(args);
            this.assignedValue = assignedValue ?? Math.floor(Math.random()*100);

            this.drawChain.addLink(this.drawText)
            this.serializationChain.addLink(serializeAssignedValue.bind(this))

            this.mixins.add(EdgeAssignedValueMixin)
        }

        get _args() {
            return {
                ...super._args,
                assignedValue: this.assignedValue
            }
        }

        drawText = ({ x: xStart, y: yStart },
                    { x: xEnd,   y: yEnd   }) => {
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
            ctx.textAlign = "center";
            ctx.fillText(this.assignedValue.toString(), 0, 0);
            ctx.restore()
        }

        static deserialize(serializedEdge) {
            let [superEdge, rest] = superclass.deserialize(serializedEdge, true);
            let assignedValueProperties = deserializeAssignedValue(rest);
            return new EdgeAssignedValue({
                                ...superEdge._args,
                                ...assignedValueProperties
                            })
        }
    }

    return EdgeAssignedValue;
}

export default EdgeAssignedValueMixin