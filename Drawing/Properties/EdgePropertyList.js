import EdgePropertyRepository from "./EdgePropertyRepository.js";

class EdgePropertyList extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: 'open'})

        this.container = this.shadowRoot.appendChild(document.createElement('div'))
        this.container.innerHTML = 'Nenhuma propriedade editável'
    }

    _appendProperty(edge, property, { label, type}) {
        let pElement = document.createElement('p')

        let lElement = document.createElement('label')
        lElement.setAttribute('for', `edge${property}`)
        lElement.textContent = label + ':'

        let iElement = document.createElement('input')
        iElement.value = edge[property]
        iElement.setAttribute('type', type)
        iElement.setAttribute('class', 'property-input')
        iElement.setAttribute('id', `edge${property}`)

        pElement.appendChild(lElement)
        pElement.appendChild(iElement)

        iElement.addEventListener('input', (event) => {
            edge[property] = event.target.value
        })
        this.container.appendChild(pElement)
    }

    updateProperties(edge, selectedAlgorithm = '') {
        this.container.innerHTML = ''

        for(let property of Object.keys(EdgePropertyRepository.default)) {
            if(edge[property]) {
                this._appendProperty(edge, property, EdgePropertyRepository.default[property])
            }
        }

        for(let property of Object.keys(EdgePropertyRepository[selectedAlgorithm])) {
            if(edge[property]) {
                this._appendProperty(edge, property, EdgePropertyRepository[selectedAlgorithm][property])
            }
        }

        if(this.container.children.length === 0) {
            this.container.innerHTML = 'Nenhuma propriedade editável'
        }
    }
}

export default EdgePropertyList