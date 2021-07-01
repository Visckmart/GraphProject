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

import {canvas, nodeColorList} from "../../Drawing/General.js";
import {HighlightsHandler} from "../../Utilities/Highlights.js";
import {positionAlphabet} from "../../Utilities/Utilities.js";
import Node from "../Node.js"
import Edge from "../Edge.js";


//region Position Encoding
function encodePosition(relativeX, relativeY, alphabet = positionAlphabet) {
    const alphabetSize = alphabet.length - 1;
    let indexX = Math.round(relativeX * alphabetSize);
    let indexY = Math.round(relativeY * alphabetSize);
    return [alphabet[indexX], alphabet[indexY]];
}

export function serializeColor() {
    // Colors
    // Se for escolhida automaticamente, serialize o índice,
    // caso contrário serialize o hexadecimal da cor.
    let serializedColor;
    let indexOfColor = nodeColorList.indexOf(this.color);
    if (indexOfColor >= 0) {
        serializedColor = indexOfColor;
    } else {
        serializedColor = this.color.slice(1);
    }
    return `-${serializedColor}`;
}

function decodePosition(serializedPos, alphabet = positionAlphabet) {
    const alphabetSize = alphabet.length - 1;
    let indexX = alphabet.indexOf(serializedPos.charAt(0));
    let indexY = alphabet.indexOf(serializedPos.charAt(1));
    if (indexX == null || indexY == null) return;
    let relativeX = indexX/alphabetSize;
    let relativeY = indexY/alphabetSize;
    return [relativeX, relativeY];
}

export function deserializeColor(serializedColor) {
    // Color
    let colorMatchResult = serializedColor.match(/([a-fA-F0-9]{6})|(\d+)/i);
    if (!colorMatchResult) return;
    let [, customColor, colorIndex] = colorMatchResult;
    return { color: customColor, colorIndex: colorIndex };
}
//endregion

export function serializeNode() {
    // Position
    // Transforma a posição absoluta em uma posição relativa ao tamanho do
    // canvas e converte para um caractere do alfabeto escolhido para isso.
    let [encodedX, encodedY] = encodePosition(this.pos.x / canvas.width, this.pos.y / canvas.height);
    let serializedPosition = `${encodedX}${encodedY}`;

    // Highlights
    // let serializedHighlights = this.highlights.prepareForSharing()
    // if (serializedHighlights) {
    //     serializedHighlights = "-" + serializedHighlights
    // }
    let serializedHighlights = "";

    return `${this.index}-${this.label}${serializedPosition}${serializedHighlights}`
}

export function deserializeNode(serializedNode, partially = false) {
    const nodeSerializationFormat = /(\d+)-(.+)?/i;
    let matchResult = serializedNode.match(nodeSerializationFormat);
    if (!matchResult) return;
    // Basic
    let [, index, moreInfo] = matchResult;
    index = parseInt(index)

    // Label and position
    const moreInfoFormat = /((?<label>[a-zA-Z0-9]{1,2})(?<pos>[a-zA-Z0-9]{2}))(-(?<rest>.+))?/i
    let moreInfoResult = moreInfo.match(moreInfoFormat);
    if (!moreInfoResult) return;
    let label = moreInfoResult.groups.label
    let serializedPos = moreInfoResult.groups.pos
    let rest = moreInfoResult.groups.rest

    let [relativeX, relativeY] = decodePosition(serializedPos);
    let xPos = relativeX * canvas.width;
    let yPos = relativeY * canvas.height;

    if (partially == false) {
        return new Node({
                            x: xPos, y: yPos, label, index, randomStart: true
                        });
    } else {
        return [{ x: xPos, y: yPos, label, index, randomStart: true }, rest];
    }
}