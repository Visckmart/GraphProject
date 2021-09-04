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

import Edge from "../Edge.js";

//region Serialização de Arestas

export function serializeEdge() {
    // let serializedHighlights = this.highlights.prepareForSharing()
    // if (serializedHighlights) {
    //     serializedHighlights = "-" + serializedHighlights
    // }
    // console.log("s", serializedHighlights)
    // return `${this.label}${serializedHighlights}`
    return ``;
}

export function deserializeEdge(serializedEdge, partially = false) {
    // console.log("deserializeEdge", serializedEdge);
    // const edgeDeserializationFormat = /([a-zA-Z0-9]+)-?(.*)?/i;
    // console.trace();
    // let matchResult = serializedEdge.match(edgeDeserializationFormat);
    // console.log(serializedEdge);
    // if (!matchResult) {
    //     console.error("Erro na deserialização: ", serializedEdge, matchResult)
    //     return;
    // }

    // let label = null;
    // let rest = null;
    // if (matchResult) {
    //     // const [, label, serializedHighlights] = matchResult;
    //     [, label, rest] = matchResult;
    // }
    // console.log(label, rest)
    // let highlights;
    // if (serializedHighlights != null) {
    //     highlights = HighlightsHandler.deserialize(serializedHighlights)
    //     // console.log("d", highlights)
    // }

    if (partially == false) {
        return new Edge();
    } else {
        return serializedEdge;
    }
}
//endregion

//region Assigned Value

export function serializeAssignedValue() {
    return `-${this.assignedValue}`;
}

export function deserializeAssignedValue(serializedValue) {
    return { assignedValue: serializedValue ? parseInt(serializedValue.substring(1)) : -1 }
}
//endregion