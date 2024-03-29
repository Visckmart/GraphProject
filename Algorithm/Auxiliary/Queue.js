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

import AlgorithmShowcase from "../../Drawing/AlgorithmVisualizations/Showcase/AlgorithmShowcase.js";

const stackElementSize = 50
const paddingTop = 30
const paddingBottom = 30

export default class Queue extends AlgorithmShowcase {
    constructor() {
        super();
        this.showcaseTitle = 'Fila'

        this._queue = []
        this._messages = []

        this._steps = []
    }

    addStep() {
        let fullMessage = (this._messages.length > 0) ? '' : 'Nenhuma ação feita'
        for(let message of this._messages) {
            fullMessage += message + '\n'
        }

        this._steps.push({
            queue: Array.from(this._queue),
            message: fullMessage
        })
        this._messages = []
    }

    loadStep(number) {
        if(this._steps[number]) {
            this._queue = this._steps[number].queue
            this.showcaseMessage = this._steps[number].message
        }

        this.updateShowcase()
    }

    updateShowcase() {
        this.resizeCanvas(this.body.clientWidth, stackElementSize + paddingTop + paddingBottom)

        requestAnimationFrame(this.drawStack)
    }

    drawStackElement = (element, index) => {
        let ctx = this.ctx

        let x = this.canvas.width/2 - stackElementSize/2
        let y = (index)*(stackElementSize+5) + 10

        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = '#00000044'
        ctx.lineWidth = 5;
        console.log(element);
        ctx.fillStyle = element.node.color;
        ctx.rect(y, paddingTop, stackElementSize, stackElementSize)
        ctx.fill()
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 30px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(element.toString(), y + stackElementSize/2, paddingTop + stackElementSize/2, stackElementSize)
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
        ctx.fillText('Estado atual da fila:', this.canvas.width/2, 0)

        if(this.length === 0) {
            ctx.font = '20px Arial'
            ctx.fillText('Fila vazia', this.canvas.width/2, this.canvas.height/2)
        }
        ctx.restore()

        let index = 0
        for(let element of this._queue) {
            this.drawStackElement(element, index)
            index++
        }
    }

    /* Funções de stack */
    insert(element) {
        this._queue.push(element)
        this._messages.push(`Inserindo o elemento ${element.toString()}.`)
    }

    remove() {
        let element = this._queue.shift()
        this._messages.push(`Removendo o elemento ${element.toString()} do início da fila.`)
        return element
    }

    isInStack(element) {
        let response =  this._queue.some(ele => ele === element)
        this._messages.push(`Verificou que o elemento ${element.toString()} ${response ? '': 'não'} está na pilha.`)
        return response
    }

    get length() {
        return this._queue.length
    }
}