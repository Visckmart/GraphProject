import {HighlightsHandler} from "./Highlights.js";
import Edge from "./Edge.js";

export function serializeEdge() {
    let serializedHighlights = this.highlights.prepareForSharing()
    if (serializedHighlights) {
        serializedHighlights = "-" + serializedHighlights
    }
    // console.log("s", serializedHighlights)
    return `${this.label}${serializedHighlights}`
}

export function deserializeEdge(serializedEdge, partially = false) {
    const edgeDeserializationFormat = /([a-zA-Z0-9]+)-?(.*)?/i;
    let matchResult = serializedEdge.match(edgeDeserializationFormat);
    if (!matchResult) {
        console.error("Erro na deserialização: ", serializedEdge, matchResult)
        return;
    }

    // const [, label, serializedHighlights] = matchResult;
    const [, label, rest] = matchResult;
    // console.log(label, rest)
    // let highlights;
    // if (serializedHighlights != null) {
    //     highlights = HighlightsHandler.deserialize(serializedHighlights)
    //     // console.log("d", highlights)
    // }

    if (partially == false) {
        return new Edge({ label })
    } else {
        return [new Edge({ label }), rest];
    }
}

export function serializeAssignedValue() {
    return `-${this.assignedValue}`;
}

export function deserializeAssignedValue(serializedValue) {
    return { assignedValue: serializedValue ? parseInt(serializedValue) : -1 }
}