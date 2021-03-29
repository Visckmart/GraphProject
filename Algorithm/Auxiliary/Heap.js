import AlgorithmShowcase from "../../Drawing/AlgorithmControls/Showcase/AlgorithmShowcase.js";

const elementRadius = 15
const distanceBetweenLevels = 50
const distanceBetweenElements = 38
const paddingTop = 50

class Heap extends AlgorithmShowcase{
    constructor() {
        super()


        this._heap = []
        this._heapSize = 0
        // Map para encontrar elementos em O(n)
        this._elementMap = new Map()

        this._steps = []
        this._messages = []
    }

    //#region Funções do heap
    insert(element, value) {
        this._heap[this._heapSize] = {element, value}
        this._heapSize++

        this._elementMap.set(element, this._heapSize - 1)

        this._siftUp(this._heapSize - 1)
        this._messages.push(`Inserindo o elemento ${element.toString()} com valor ${value} no heap e ajustando para cima.`)
    }

    remove() {
        //console.log(this._heap.map(h => h?.value))
        // Retorna null caso não haja nenhum elemento no heap
        if(this._heapSize === 0) {
            return null
        }

        let returnValue = this._heap[0].element

        // Mais de um elemento no heap
        if(this._heapSize > 1) {
            this._heap[0] = this._heap[this._heapSize - 1]

            // Atualizando map
            this._elementMap.set(this._heap[0], 0)

            this._heap[this._heapSize - 1] = null
            this._heapSize--
            this._siftDown(0)
        } else {
            this._heap[0] = null
            this._heapSize--
        }

        this._elementMap.delete(returnValue)
        this._messages.push(`Removendo o elemento ${returnValue.toString()} no heap e ajustando para baixo.`)
        return returnValue
    }

    peek() {
        return this._heap[0].element
    }

    clear() {
        this._heap = []
        this._heapSize = 0
        this._elementMap = new Map()
    }

    changeValue(element, value) {
        let index = this._elementMap.get(element)
        if(this._heap[index]?.element === element)
        {
            let isNewValueBetter = this._compare(this._heap[index].value, value)

            let oldValue = this._heap[index].value
            this._heap[index].value = value

            if(isNewValueBetter) {
                this._messages.push(`Mudando o valor do elemento ${element.toString()} de ${oldValue} para ${value} no heap e ajustando para cima.`)
                this._siftUp(index)
            } else {
                this._messages.push(`Mudando o valor do elemento ${element.toString()} de ${oldValue} para ${value} no heap e ajustando para baixo.`)
                this._siftDown(index)
            }
        }
    }

    _parentIndex(index) {
        return Math.floor((index - 1) / 2)
    }

    _siftDown(index) {
        if(this._heapSize > 2 * index + 2)
        {
            let bestIndex = this._compare(this._heap[2*index + 1].value, this._heap[2*index + 2].value) ? 2*index + 2 : 2*index + 1
            // Se index não é melhor que a menor criança troca eles de lugar
            if(!this._compare(this._heap[index], this._heap[bestIndex])) {
                this._switchIndexes(index, bestIndex)

                this._siftDown(bestIndex)
            }
        } else if(this._heapSize > 2 * index + 1) {
            if(!this._compare(this._heap[index].value, this._heap[2 * index + 1].value)) {
                this._switchIndexes(index, 2 * index + 1)
            }
        }
    }

    _siftUp(index) {
        if(index === 0) {
            return
        }
        let parentIndex = this._parentIndex(index)
        if(!this._compare(this._heap[index].value, this._heap[parentIndex].value)) {
            this._switchIndexes(index, parentIndex)

            this._siftUp(parentIndex)
        }
    }

    _compare(value1, value2) {
        console.warn("HEAP GENÉRICO NÃO IMPLEMENTA COMPARAÇÃO")
    }


    _switchIndexes(index1, index2) {
        // console.log('Index1:', this._heap[index1])
        // console.log('Index2:', this._heap[index2])

        let temp = this._heap[index1]
        this._heap[index1] = this._heap[index2]
        this._heap[index2] = temp

        // Atualizando mapa
        this._elementMap.set(this._heap[index1].element, index1)
        this._elementMap.set(this._heap[index2].element, index2)
    }
    //#endregion
    //#region Funções de showcase
    addStep() {
        let fullMessage = this._messages.length > 0 ? 'Ações dessa etapa:\n' : 'Nenhuma ação feita nessa etapa'
        for(let message of this._messages) {
            fullMessage += '• ' + message + '\n\n'
        }

        this._steps.push({
            heap: Array.from(this._heap),
            heapSize: this._heapSize,
            message: fullMessage
        })
        this._messages = []
    }

    loadStep(number) {
        if(this._steps[number]) {
            this._heapSize = this._steps[number].heapSize
            this._heap = this._steps[number].heap

            this.showcaseMessage = this._steps[number].message


            let maxWidth = distanceBetweenElements *  (2 ** Math.floor(Math.log2(this._heapSize + 1)))
            this.resizeCanvas(Math.max(maxWidth, this.body.clientWidth),
                 Math.floor(Math.log2(this._heapSize)+1) * (elementRadius + distanceBetweenLevels) + paddingTop)

            requestAnimationFrame(this.drawHeap)
        }
    }

    drawHeap = () => {
        if(this._heapSize > 0)
        {
            let ctx = this.ctx
            ctx.save()
            ctx.beginPath()
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = '#ffffff'
            ctx.font = '20px Arial'
            ctx.fillText('Estado atual do heap:', this.canvas.width/2, 0)
            ctx.restore()
            this.drawHeapElement(this._heap[0], 0, this.canvas.width/2, paddingTop, false)
        }
    }

    _drawElement(x, y, element) {
        let ctx = this.ctx
        ctx.save()
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#8b0000'
        // ctx.fillStyle = '#ff726f'
        ctx.strokeStyle = element._originalcolor
        ctx.beginPath();
        ctx.arc(x, y, elementRadius, 0, 2*Math.PI);

        ctx.stroke()
        ctx.fillStyle = "black"
        ctx.fill()
        ctx.fillStyle = element._originalcolor
        ctx.globalAlpha = 0.5
        ctx.fill()
        ctx.globalAlpha = 1

        ctx.beginPath()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 15px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(element.toString(), x, y, elementRadius * 2)
        ctx.restore()
    }

    _startDrawLines = (x, y) => {
        let ctx = this.ctx
        ctx.save()
        ctx.lineWidth = 2
        ctx.strokeStyle = "#fff";
        ctx.setLineDash([]);

        ctx.beginPath()
        ctx.moveTo(x, y);
    }

    _finishDrawLines = (x, y) => {
        let ctx = this.ctx
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore()
    }

    _drawValue = (value, elementX, elementY, isLeft) => {
        let ctx = this.ctx

        ctx.save()
        ctx.beginPath()
        ctx.textAlign = isLeft ? 'right' : 'left'
        ctx.textBaseline = 'bottom'
        ctx.font = '12px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(value === Infinity ? '∞' : value.toString(), elementX,
                     elementY - elementRadius, elementRadius)
        ctx.fill()
        ctx.restore()
    }

    _calculateDistanceBetweenLevels(index) {
        return 2 ** (Math.floor(Math.log2(this._heapSize + 1))
            - Math.floor(Math.log2(index + 1) - 1) - 1)
            * distanceBetweenElements
    }

    drawHeapElement = ({element, value}, index, parentX, parentY, isLeft) => {
        let x, y
        // Caso seja o primeiro elemento desenha no centro
        if(index === 0) {
            x = parentX
            y = parentY
        // Caso contrário desenha do lado especificado pelo parâmetro
        } else {
            let levelDistance = this._calculateDistanceBetweenLevels(index)
            x = parentX + (isLeft ?
                -levelDistance/2 :
                levelDistance/2)
            y = parentY + distanceBetweenLevels
            this._finishDrawLines(x, y)
        }


        // Se existe filho a esquerda chama a recursão a esquerda
        let leftChildIndex = index * 2 + 1
        if(this._heap[leftChildIndex]) {
            this._startDrawLines(x, y)
            this.drawHeapElement(this._heap[leftChildIndex], leftChildIndex, x, y, true)
        }

        // Se existe filho a direita chama a recursão a direita
        let rightChildIndex = leftChildIndex + 1
        if(this._heap[rightChildIndex]) {
            this._startDrawLines(x, y, false)
            this.drawHeapElement(this._heap[rightChildIndex], rightChildIndex, x, y, false)
        }
        this._drawElement(x,y, element)
        this._drawValue(value, x, y, isLeft)
    }
    //#endregion
}

export class MaxHeap extends Heap {
    constructor() {
        super();
        this.showcaseTitle = 'Max Heap Binário'
    }

    _compare(value1, value2) {
        return value2 > value1
    }
}

export class MinHeap extends Heap {
    constructor() {
        super();

        this.showcaseTitle = 'Min Heap Binário'
    }

    _compare(value1, value2) {
        return value2 < value1
    }
}