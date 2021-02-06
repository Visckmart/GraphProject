import EdgePropertyRepository from "./EdgePropertyRepository.js";
import NodePropertyRepository from "./NodePropertyRepository.js";

class PropertyList extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: 'open'})
        /* Aplicando style na shadow root */
        let style = document.createElement('style');
        style.textContent = `
            .property-input {
                width: 50pt;
            }
        `

        this.shadowRoot.appendChild(style)

        this.container = this.shadowRoot.appendChild(document.createElement('div'))
        this.container.innerHTML = 'Nenhuma propriedade editável'

        this.artifactType = this.getAttribute('artifact')

        switch (this.artifactType) {
            case 'edge':
                this.repository = EdgePropertyRepository
                break
            case 'node':
                this.repository = NodePropertyRepository
                break
        }
    }

    _appendProperty(artifact, property, { label, type}) {
        let pElement = document.createElement('p')

        let lElement = document.createElement('label')
        lElement.setAttribute('for', `${this.artifactType}${property}`)
        lElement.textContent = label + ':'

        let iElement = document.createElement('input')
        iElement.value = artifact[property]
        iElement.setAttribute('type', type)
        iElement.setAttribute('class', 'property-input')
        iElement.setAttribute('id', `${this.artifactType}${property}`)

        pElement.appendChild(lElement)
        pElement.appendChild(iElement)

        iElement.addEventListener('input', (event) => {
            artifact[property] = event.target.value
        })
        this.container.appendChild(pElement)
    }

    updateProperties(edge, selectedAlgorithm = '') {
        this.container.innerHTML = ''

        for(let property of Object.keys(this.repository.default ?? {})) {
            if(edge[property]) {
                this._appendProperty(edge, property, this.repository.default[property])
            }
        }

        for(let property of Object.keys(this.repository[selectedAlgorithm] ?? {})) {
            if(edge[property]) {
                this._appendProperty(edge, property, this.repository[selectedAlgorithm][property])
            }
        }

        if(this.container.children.length === 0) {
            this.container.innerHTML = 'Nenhuma propriedade editável'
        }
    }
}

export default PropertyList