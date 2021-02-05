import {ctx} from "../../../Drawing/General.js";

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
    ctx.stroke();
}

let NodeAssignedValueMixin = (superclass) => {
    return class NodeAssignedValue extends  superclass {
        constructor({assignedValue = '', ...args}) {
            super(args)
            this.assignedValue = assignedValue

            this.drawChain.addLink(this.drawAuxLabel)
        }

        get _args() {
            return {
                ...super._args,
                assignedValue: this.assignedValue
            }
        }

        drawAuxLabel = () => {
            if(!this.assignedValue)
            {
                return
            }
            ctx.save()
            ctx.font = "bold 15pt Arial";
            ctx.strokeStyle = this._originalcolor;
            ctx.setLineDash([])
            ctx.lineWidth = 4
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            let m = ctx.measureText(this.assignedValue)
            let boxWidth = m.width + 5
            let boxHeight = 20
            let boxOffset = 45
            ctx.beginPath();
            roundRect(ctx,
                this.pos.x - boxWidth/2,
                this.pos.y - boxOffset - boxHeight/2,
                boxWidth, boxHeight, 5)
            ctx.fillStyle = this._originalcolor
            ctx.fill();
            ctx.fillStyle = "white"
            ctx.fillText(this.assignedValue, this.pos.x, this.pos.y - boxOffset);
            ctx.restore()
        }
    }
}

export default NodeAssignedValueMixin
/*

let NodeAssignedValue = NodeAssignedValueMixin(Node)

let nodeSoValue = new NodeAssignedValue({x: 100, y: 200, label: 'label', assignedValue: 'Olá'})

console.log(nodeSoValue)
*/