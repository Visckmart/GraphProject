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
}
function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

let NodeAssignedValueMixin = (superclass) => {
    return class NodeAssignedValue extends  superclass {
        constructor({assignedValue = '', ...args}) {
            super(args)
            this.assignedValue = assignedValue

            this.drawChain.addLink(this.drawAuxLabel)
            this.tx = 0;
            this.ty = 0;
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
            if (this.assignedValue == "∞") {
                ctx.font = "bold 25pt Arial";
            }
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
            let tx = Math.floor(this.pos.x)
            let ty = Math.floor(this.pos.y)
            let zz = `m${tx - 7},${ty - 57}` + this.s
        // ctx.save()
            ctx.lineWidth = 3
            if (this.tx != tx || this.ty != ty) {
                this.p = new Path2D(zz);
            }
            // ctx.fill(this.p)
            ctx.fillStyle = "#888"
            ctx.globalAlpha = 0.35
            if (this.assignedValue != "∞") {
                ctx.fillStyle = this._originalcolor
                ctx.globalAlpha = 1
            }
            ctx.fill(this.p);
            ctx.globalAlpha = 1
            if (this.assignedValue != "∞") {
                ctx.fillStyle = "white"
            }
            ctx.fillText(this.assignedValue, this.pos.x, this.pos.y - boxOffset);
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