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
            case 'all':
                this.repository = EdgePropertyRepository
                // Unindo os dois repositórios
                for(let algorithm of Object.keys(this.repository))
                {
                    for(let property of Object.keys(NodePropertyRepository[algorithm] ?? {}))
                    {
                        if(!this.repository[algorithm][property]) {
                            this.repository[algorithm][property] = NodePropertyRepository[algorithm][property]
                        }
                    }
                }
        }
    }

    _appendProperty(artifacts, property, { label, type, selected = false}) {
        let pElement = document.createElement('p')

        let lElement = document.createElement('label')
        lElement.setAttribute('for', `${this.artifactType}${property}`)
        lElement.setAttribute('style', `margin-right: 8pt`)
        lElement.textContent = label + ':'

        let iElement = document.createElement('input')
        if(artifacts.length === 1)
        {
            iElement.value = artifacts[0][property]
        } else {
            iElement.value = ''
        }
        iElement.setAttribute('type', type)
        iElement.setAttribute('class', 'property-input')
        iElement.setAttribute('id', `${this.artifactType}${property}`)
        iElement.setAttribute('placeholder', 'Valor')

        pElement.appendChild(lElement)
        pElement.appendChild(iElement)

        iElement.addEventListener('input', (event) => {
            artifacts.map(a => a[property] = event.target.value)
        })
        this.container.appendChild(pElement)
        if(selected) {
            // Focando num timeout por que navegadores são estranhos
            setTimeout(() => {
                iElement.focus()
                iElement.select()
            }, 0)
        }
    }

    updateProperties(selectedAlgorithm = '', ...artifacts) {
        this.container.innerHTML = ''

        for(let property of Object.keys(this.repository.default ?? {})) {
            if(!artifacts.some(e => !e[property])) {
                this._appendProperty(artifacts, property, this.repository.default[property])
            }
        }

        for(let property of Object.keys(this.repository[selectedAlgorithm] ?? {})) {
            if(!artifacts.some(e => !e[property])) {
                this._appendProperty(artifacts, property, this.repository[selectedAlgorithm][property])
            }
        }

        if(this.container.children.length === 0) {
            this.container.innerHTML = 'Nenhuma propriedade editável'
        }
    }
}

export default PropertyList