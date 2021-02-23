import AlgorithmShowcase from "../../Drawing/AlgorithmControls/AlgorithmShowcase.js";

class Subset {
    constructor(element) {
        this.parent = this
        this.rank = 0
        this.element = element
    }
}

export default class UnionFind extends AlgorithmShowcase {
    constructor(elementList) {
        super();
        this.showcaseTitle = "Estrutura Union-Find"

        this._subsetMap = new Map()

        this._steps = []
        this._messages = []

        for(let element of elementList) {
            this._subsetMap.set(element, new Subset())
        }
    }

    /* Funções do showcase */
    addStep() {
        let fullMessage = (this._messages.length > 0) ? 'Ações desse passo: \n\n' : 'Nenhuma ação feita'
        for(let message of this._messages) {
            fullMessage += '• ' + message + '\n\n'
        }
        this._messages = []

        let clonedMap = new Map()
        let cloneSubsetMap = new Map()

        // Clonando mapa
        for(let [element, subset] of this._subsetMap.entries()) {
            let cloneSubset = new Subset(element)
            cloneSubset.rank = subset.rank
            cloneSubset.parent = subset.parent

            cloneSubsetMap.set(subset, cloneSubset)
            clonedMap.set(element, cloneSubset)
        }

        // Mapeando pais dos elementos para seus clones
        for(let [, subset] of cloneSubsetMap) {
            if(subset.parent) {
                subset.parent = cloneSubsetMap.get(subset)
            }
        }

        this._steps.push({
            map: clonedMap,
            message: fullMessage
        })
    }

    loadStep(number) {
        let step = this._steps[number]
        if(step) {
            this.showcaseMessage = step.message
            this._subsetMap = step.map
        }
    }

    /* Funções do UnionFind */
    union(element1, element2) {
        let subset1 = this.find(element1)
        let subset2 = this.find(element2)


        if(!subset1 || !subset2 || subset1 === subset2) {
            console.error("Erro na união")
            console.trace()
            return
        }

        if(subset1.rank > subset2.rank) {
            subset2.parent = subset1
            this._messages.push(`Tornando ${subset1.element.toString()} \
            o pai do elemento ${subset2.element.toString()} pois \
            seu rank ${subset1.rank} é maior`)
        }
        else if(subset2.rank > subset1.rank) {
            subset1.parent = subset2
            this._messages.push(`Tornando ${subset2.element.toString()} \
            o pai do elemento ${subset1.element.toString()} pois \
            seu rank ${subset2.rank} é maior`)
        }
        else {
            subset2.parent = subset1
            subset1.rank++
            this._messages.push(`Tornando ${subset1.element.toString()} \
            o pai do elemento ${subset2.element.toString()} pois \
            seus ranks eram iguais. Aumentando o rank de ${subset1.element.toString()} \
            para ${subset1.rank}.`)
        }
    }

    // Função que acha a raiz do grupo do element
    // e faz que todos subset no caminho sejam filhos dessa raiz.
    find(element) {
        let subset = this._subsetMap.get(element)


        if(!subset) {
            console.error("Erro no find")
            console.trace()
            return
        }

        if(subset.parent !== subset) {
            subset.parent = this.find(subset.parent)
        }

        this._messages.push(`Achando o pai do elemento ${element.toString()} \
        que é ${subset.parent.element.toString()}`)
        return subset?.parent?.element
    }
}