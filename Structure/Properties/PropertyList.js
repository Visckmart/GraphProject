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

import EdgePropertyRepository from "./EdgePropertyRepository.js";
import NodePropertyRepository from "./NodePropertyRepository.js";
import { g } from "../../Drawing/GraphView.js";

// TODO: Usar templates
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
                this.repository = {}
                // Unindo os dois repositórios
                for(let algorithm of Object.keys(EdgePropertyRepository))
                {
                    for(let property of Object.keys(EdgePropertyRepository[algorithm] ?? {}))
                    {
                        if(NodePropertyRepository?.[algorithm]?.[property]) {
                            this.repository[algorithm][property] = NodePropertyRepository[algorithm][property]
                        }
                    }
                }
                break
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
        if (label == "Label") { iElement.setAttribute('maxLength', 2); }

        pElement.appendChild(lElement)
        pElement.appendChild(iElement)

        iElement.addEventListener('input', (event) => {
            if (type != "text" || event.target.value != "") {
                artifacts.map(a => a[property] = event.target.value)
                g.refreshGraph()
                g.registerStep()
            }
        })
        this.container.appendChild(pElement)

        if(selected && artifacts.length <= 1) {
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