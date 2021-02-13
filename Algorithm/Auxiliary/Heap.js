class Heap {
    constructor() {
        this._heap = []
        this._heapSize = 0
        // Map para encontrar elementos em O(n)
        this._elementMap = new Map()
    }

    insert(element, value) {
        this._heap[this._heapSize] = {element, value}
        this._heapSize++

        this._elementMap.set(element, this._heapSize - 1)

        this._siftUp(this._heapSize - 1)
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
            let isNewValueBetter = this._compare(value, this._heap[index].value)
            this._heap[index].value = value

            if(isNewValueBetter) {
                this._siftUp(index)
            } else {
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
            let bestIndex = this._compare(this._heap[2*index + 1].value, this._heap[2*index + 2].value) ? 2*index + 1 : 2*index + 2
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

}

export class MaxHeap extends Heap {
    constructor() {
        super();
    }

    _compare(value1, value2) {
        return value2 > value1
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