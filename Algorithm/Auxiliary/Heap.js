class Heap {
    constructor() {
        this._heap = []
        this._heapSize = 0
        // Map para encontrar elementos em O(n)
        this._elementMap = new Map()
    }

    insert(element, value) {
        this._heap[this._heapSize - 1]({element, value})
        this._heapSize++

        this._elementMap.set(element, this._heapSize - 1)

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

    changeValue(element, value) {
        let index = this._elementMap.get(element)
        let isNewValueBetter = this._compare(value, this._heap[index].value)
        this._heap[index].value = value

        if(isNewValueBetter) {
            this._siftUp(index)
        } else {
            this._siftDown(index)
        }
    }

    _parentIndex(index) {
        return Math.floor((index - 1) / 2)
    }

    _siftDown(index) {
        if(this._heapSize > 2 * index + 2)
        {
            let bestIndex = this._compare(this._heap[2*index + 1].value, this._heap[2*index + 2].value) ? 2*index + 1 : 2*index + 2
            // Se index não é melhor que a menor criança troca eles de lugar
            if(!this._compare(this._heap[index], this._heap[bestIndex])) {
                let temp = this._heap[index]
                this._heap[index] = this._heap[bestIndex]
                this._heap[bestIndex] = temp

                // Atualizando mapa
                this._elementMap.set(this._heap[index].element, index)
                this._elementMap.set(this._heap[bestIndex].element, bestIndex)

                this._siftDown(bestIndex)
            }
        } else if(this._heapSize > 2 * index + 1) {
            if(!this._compare(this._heap[index].value, this._heap[2 * index + 1].value)) {
                let temp = this._heap[index]
                this._heap[index] = this._heap[2 * index + 1]
                this._heap[2 * index + 1] = temp

                // Atualizando mapa
                this._elementMap.set(this._heap[index].element, index)
                this._elementMap.set(this._heap[2 * index + 1].element, 2 * index + 1)
            }
        }
    }

    _siftUp(index) {
        if(index === 0) {
            return
        }

        let parentIndex = this._parentIndex(index)
        if(!this._compare(this._heap[index].value, this._heap[parentIndex].value)) {
            let temp = this._heap[index]
            this._heap[index] = this._heap[parentIndex]
            this._heap[parentIndex] = temp

            // Atualizando mapa
            this._elementMap.set(this._heap[index].element, index)
            this._elementMap.set(this._heap[parentIndex].element, parentIndex)

            this._siftUp(parentIndex)
        }
    }

    _compare(value1, value2) {
        console.warn("HEAP GENÉRICO NÃO IMPLEMENTA COMPARAÇÃO")
    }

}

export class MaxHeap extends Heap {
    constructor() {
        super();
    }

    _compare(value1, value2) {
        return value1 > value2
    }
}

export class MinHeap extends Heap {
    constructor() {
        super();
    }

    _compare(value1, value2) {
        return value2 < value1
    }
}