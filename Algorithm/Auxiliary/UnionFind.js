import AlgorithmShowcase from "../../Drawing/AlgorithmControls/Showcase/AlgorithmShowcase.js";

const elementSize = 50
const paddingTop = 30
const paddingBottom = 30
const spaceBetweenGroups = 80

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
            this._subsetMap.set(element, new Subset(element))
        }
    }

    /* Funções do showcase */
    _drawElement = (x, y, element) => {
        let ctx = this.ctx

        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = element?.color ?? '#ff726f'
        ctx.fillStyle = element?.color ?? '#ff726f'
        ctx.rect(x, y, elementSize, elementSize)
        ctx.globalAlpha = 0.8
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 30px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(element.toString(), x + elementSize/2, y + elementSize/2, elementSize)
        ctx.restore()
    }

    drawUnionFind = () => {
        let groups = {}

        for(let [element,] of this._subsetMap.entries()) {
            let root = this.find(element)
            if(!groups[root]) {
                groups[root] = []
            }
            groups[root].push(element)
        }

        let maxGroupSize = Math.max(...Object.values(groups).map(g => g.length))

        this.resizeCanvas(Math.max(maxGroupSize * elementSize, this.body.clientWidth), Object.keys(groups).length * spaceBetweenGroups + paddingTop)

        let ctx = this.ctx
        ctx.save()
        ctx.beginPath()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'
        ctx.fillText('Estado atual dos grupos:', this.canvas.width/2, 0)

        let groupIndex = 0
        for(let group of Object.values(groups)) {
            group.forEach((element, index) => {
                this._drawElement(index * elementSize, groupIndex * spaceBetweenGroups + paddingTop, element)
            })
            groupIndex++
        }
    }

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
        for(let [, subset] of cloneSubsetMap.entries()) {
            if(subset.parent) {
                subset.parent = cloneSubsetMap.get(subset.parent)
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

            requestAnimationFrame(this.drawUnionFind)
        }

    }

    /* Funções do UnionFind */
    union(element1, element2) {
        let subset1 = this._subsetMap.get(this.find(element1, false))
        let subset2 = this._subsetMap.get(this.find(element2, false))


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
    find(element, printMessage=true) {
        let subset = this._subsetMap.get(element)
        if(!subset) {
            console.error("Erro no find")
            console.trace()
            return
        }

        if(subset.parent !== subset) {
            subset.parent = this._subsetMap.get(this.find(subset.parent.element, false))
        }

        if(printMessage)
        {
            this._messages.push(`Achando o pai do elemento ${element.toString()} \
            que é ${subset.parent.element.toString()}`)
        }
        return subset?.parent?.element
    }
}