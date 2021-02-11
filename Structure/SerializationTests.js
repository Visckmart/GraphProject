

function serializeEdge(label, highlights = new Set()) {
    // let serializedHighlights = highlights.prepareForSharing()
    // if (serializedHighlights) {
    //     serializedHighlights = "-" + serializedHighlights
    // }
    return `${label}`
}

function deserializeEdge(serializedEdge, partially = false) {
    const edgeDeserializationFormat = /([a-zA-Z0-9]+)-?(.*)?/i;
    let matchResult = serializedEdge.match(edgeDeserializationFormat);
    if (!matchResult) {
        console.error("Erro na deserialização: ", serializedEdge, matchResult)
        return;
    }
    const [, label, rest] = matchResult;
    let newEdge = `|Label: ${label}|`
    if (partially == false) {
        return newEdge;
    } else {
        return [newEdge, rest]
    }
}

// console.log(simpleEdge)
console.log(serializeEdge("a"));