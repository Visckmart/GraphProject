import {ctx} from "../../../Drawing/General";

let EdgeAssignedValueMixin = (superclass) => {
    return class EdgeAssignedValue extends superclass {
        constructor({assignedValue = 1, ...args}) {
            super(args);

            this.assignedValue = assignedValue

            this.drawChain.addLink(this.drawText)
        }

        get _args() {
            return {
                ...super._args,
                assignedValue: this.assignedValue
            }
        }

        drawText = ({ x: xStart, y: yStart },
                  { x: xEnd,   y: yEnd   }) => {

            // yEnd -= vertOffset
            // yStart -= vertOffset
            // Calcula o meio da linha
            let midX = (xEnd - xStart)/2
            let midY = (yEnd - yStart)/2

            ctx.translate(xStart + midX, yStart + midY);

            // Calcula o ângulo do texto
            let angle = Math.atan2(midY, midX)
            // Não permite que o texto fique de cabeça para baixo
            if (Math.abs(angle) > Math.PI/2) {
                angle = Math.atan2(-midY, -midX)
            }
            ctx.rotate(angle);

            // Deslocamento vertical faz com que o texto não seja desenhado
            // por cima da linha
            let vertOffset = 15
            ctx.translate(0, -vertOffset);

            ctx.font = "bold 15pt Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.assignedValue, 0, 0);
        }
    }
}