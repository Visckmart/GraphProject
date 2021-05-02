function observingEdge(edgeValue) {
    return `Observando a aresta remanescente com menor peso (${edgeValue}).`
}

export default {
    init: (numeroDeNos) => {
        return `Inicializando uma floresta com ${numeroDeNos} árvores compostas
                por nós desconexos. Ordenando as arestas pelos seus pesos.`
    },

    edgeAddition: (edgeValue, nodeA, nodeB) => {
        return `${observingEdge(edgeValue)} A aresta conecta duas árvores
        diferentes contendo os nós ${nodeA} e ${nodeB} e portanto será incluída, unindo as árvores.`
    },

    edgeIgnored: (edgeValue, nodeA, nodeB) => {
        return `${observingEdge(edgeValue)} A aresta conecta dois nós
        ${nodeA} e ${nodeB} da mesma árvore e portanto não será incluída.`
    },

    conclusion: (onlyOneTree) => {
        let end = onlyOneTree
                ? "uma flortesta com uma única árvore geradora mínima."
                : "uma floresta geradora mínima, ou seja, um conjunto de árvores geradoras mínimas."

        return "Todas as arestas foram observadas. O resultado é " + end
    }
}