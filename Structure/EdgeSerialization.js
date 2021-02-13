import Edge from "./Edge.js";

// Serialização de Arestas
export function serializeEdge() {
    // let serializedHighlights = this.highlights.prepareForSharing()
    // if (serializedHighlights) {
    //     serializedHighlights = "-" + serializedHighlights
    // }
    // console.log("s", serializedHighlights)
    // return `${this.label}${serializedHighlights}`
    return `${this.label}`
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
        return new Edge({ label });
    } else {
        return [{ label }, rest];
    }
}

//region Assigned Value
class Original {
    getX() { return 7; }
}

export class Sub extends Original {
    getX() {
        return super.getX() + 11;
    }
}
// let sub = new Sub()
// // sub.getX = () => 20;
// console.log(sub.getX())
//
// const FrozenSub = new Sub();
// Object.freeze(FrozenSub);
// FrozenSub.getX = () => 21;
// console.log(FrozenSub.getX())

class Alternative {
    constructor() {
        this.z = new Sub().getX;
    }
}
export function serializeAssignedValue() {
    return `-${this.assignedValue}`;
}
// let alt = new Alternative();
// console.log(alt.z())

export function deserializeAssignedValue(serializedValue) {
    return { assignedValue: serializedValue ? parseInt(serializedValue) : -1 }
}
//endregion