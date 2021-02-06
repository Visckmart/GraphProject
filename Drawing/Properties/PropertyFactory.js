import EdgePropertyRepository from "./EdgePropertyRepository.js";

function createEdgeProperty(edge,property, { label, type}) {
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
    return pElement
}

export function createEdgeProperties(edge, selectedAlgorithm = '') {
    let propertyForms = []
    for(let property of Object.keys(EdgePropertyRepository.default)) {
        if(edge[property]) {
            propertyForms.push(createEdgeProperty(edge, property, EdgePropertyRepository.default[property]))
        }
    }

    for(let property of Object.keys(EdgePropertyRepository[selectedAlgorithm])) {
        if(edge[property]) {
            propertyForms.push(createEdgeProperty(edge, property, EdgePropertyRepository[selectedAlgorithm][property]))
        }
    }
    return propertyForms
}