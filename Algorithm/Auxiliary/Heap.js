class Heap {
    constructor() {
        this._heap = []
        this._heapSize = 0
    }

    insert(element, value) {
        this._heap.push({element, value})
        this._heapSize++

        this._siftUp(this._heap.length - 1)
    }

    remove() {
        // Retorna null caso não haja nenhum elemento no heap
        if(this._heap.length === 0) {
            return null
        }

        this._heapSize--
        let returnValue = this._heap[0]

        // Mais de um elemento no heap
        if(this._heap.length > 1) {
            this._heap[0] = this._heap[this._heap.length - 1]
            this._heap[this._heap.length - 1] = null
            this._siftDown(0)
        } else {
            this._heap[0] = null
        }
        return returnValue
    }

    peek() {
        return this._heap[0]
    }

    clear() {
        this._heap = []
        this._heapSize = 0
    }

    _parentIndex(index) {
        return Math.floor((index - 1) / 2)
    }

    _siftDown(index) {
        if(this._heapSize > 2 * index + 2)
        {
            let bestIndex = this._compare(this._heap[2*index + 1], this._heap[2*index + 2]) ? 2*index + 1 : 2*index + 2
            // Se index não é melhor que a menor criança troca eles de lugar
            if(!this._compare(this._heap[index], this._heap[bestIndex])) {
                let temp = this._heap[index]
                this._heap[index] = this._heap[bestIndex]
                this._heap[bestIndex] = temp

                this._siftDown(bestIndex)
            }
        } else if(this._heapSize > 2 * index + 1) {
            if(!this._compare(this._heap[index], this._heap[2 * index + 1])) {
                let temp = this._heap[index]
                this._heap[index] = this._heap[2 * index + 1]
                this._heap[2 * index + 1] = temp
            }
        }
    }

    _siftUp(index) {
        if(index === 0) {
            return
        }

        let parentIndex = this._parentIndex(index)
        if(!this._compare(this._heap[index], this._heap[parentIndex])) {
            let temp = this._heap[index]
            this._heap[index] = this._heap[parentIndex]
            this._heap[parentIndex] = temp

            this._siftUp(parentIndex)
        }
    }

    _compare(element1, element2) {
        console.warn("HEAP GENÉRICO NÃO IMPLEMENTA COMPARAÇÃO")
    }
}

export class MaxHeap extends Heap {
    constructor() {
        super();
    }

    _compare(element1, element2) {
        return element1.value > element2.value
    }
}

export class MinHeap extends Heap {
    constructor() {
        super();
    }

    _compare(element1, element2) {
        return element2.value < element1.value
    }
}