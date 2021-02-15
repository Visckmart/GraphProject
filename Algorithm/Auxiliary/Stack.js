import AlgorithmShowcase from "../../Drawing/AlgorithmControls/AlgorithmShowcase.js";
import {ctx} from "../../Drawing/General.js";

const stackElementSize = 50
const paddingTop = 30
const paddingBottom = 30

export default class Stack extends AlgorithmShowcase {
    constructor() {
        super();
        this.showcaseTitle = 'Pilha'

        this._stack = []
        this._messages = []

        this._steps = []
    }

    addStep() {
        this._steps.push({
            stack: Array.from(this._stack),
            messages: Array.from(this._messages)
        })
        this._messages = []
    }

    loadStep(number) {
        if(this._steps[number]) {
            this._stack = this._steps[number].stack
            this._messages = this._steps[number].messages
        }

        this.updateShowcase()
    }

    updateShowcase() {
        let fullMessage = (this._messages.length > 0) ? 'Ações desse passo: \n\n' : 'Nenhuma ação feita'
        for(let message of this._messages) {
            fullMessage += message + '\n'
        }
        this.showcaseMessage = fullMessage
        this.resizeCanvas(this.body.clientWidth, this.length * stackElementSize + paddingTop + paddingBottom)

        requestAnimationFrame(this.drawStack)

    }

    drawStackElement = (element, index) => {
        let ctx = this.ctx

        let x = this.canvas.width/2 - stackElementSize/2
        let y = (this.length - index - 1)*stackElementSize + paddingTop

        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = '#8b0000'
        ctx.fillStyle = '#ff726f'
        ctx.rect(x, y, stackElementSize, stackElementSize)
        ctx.fill()
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 30px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(element.toString(), x + stackElementSize/2, y + stackElementSize/2, stackElementSize)
        ctx.restore()
    }

    drawStack = () => {
        let ctx = this.ctx

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        ctx.save()
        ctx.beginPath()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'
        ctx.fillText('Estado atual da pilha:', this.canvas.width/2, 0)

        if(this.length === 0) {
            ctx.font = '20px Arial'
            ctx.fillText('Pilha vazia', this.canvas.width/2, this.canvas.height/2)
        }
        ctx.restore()

        let index = 0
        for(let element of this._stack) {
            this.drawStackElement(element, index)
            index++
        }
    }

    /* Funções de stack */
    push(element) {
        this._stack.push(element)
        this._messages.push(`Inserindo o elemento ${element.toString()}`)
    }

    pop() {
        let element = this._stack.pop()
        this._messages.push(`Removendo o elemento ${element.toString()} do topo da pilha`)
        return element
    }

    get length() {
        return this._stack.length
    }
}