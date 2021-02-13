import {canvas, nodeColorList} from "../Drawing/General.js";
import {HighlightsHandler} from "./Highlights.js";
import {positionAlphabet} from "./Utilities.js";
import Node from "./Node.js"


//region Position Encoding
function encodePosition(relativeX, relativeY, alphabet = positionAlphabet) {
    const alphabetSize = alphabet.length - 1;
    let indexX = Math.round(relativeX * alphabetSize);
    let indexY = Math.round(relativeY * alphabetSize);
    return [alphabet[indexX], alphabet[indexY]];
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
//endregion

export function serializeNode() {
    // Colors
    // Se for escolhida automaticamente, serialize o índice,
    // caso contrário serialize o hexadecimal da cor.
    let serializedColors;
    let indexOfColor = nodeColorList.indexOf(this._originalcolor);
    if (indexOfColor >= 0) {
        serializedColors = indexOfColor;
    } else {
        serializedColors = this._originalcolor.slice(1);
    }

    // Position
    // Transforma a posição absoluta em uma posição relativa ao tamanho do
    // canvas e converte para um caractere do alfabeto escolhido para isso.
    let [encodedX, encodedY] = encodePosition(this.pos.x / canvas.width, this.pos.y / canvas.height);
    let serializedPosition = `${encodedX}${encodedY}`

    // Highlights
    let serializedHighlights = this.highlights.prepareForSharing()
    if (serializedHighlights) {
        serializedHighlights = "-" + serializedHighlights
    }

    return `${this.index}-${serializedColors}-${this.label}${serializedPosition}${serializedHighlights}`
}

export function deserializeNode(serializedNode) {
    const nodeSerializationFormat = /(\d+)-(.+?)-(.+)?/i;
    let matchResult = serializedNode.match(nodeSerializationFormat);
    if (!matchResult) return;
    // Basic
    let [, index, serializedColor, moreInfo] = matchResult;
    index = parseInt(index)

    // Color
    let colorMatchResult = serializedColor.match(/([a-fA-F0-9]{6})|(\d+)/i);
    if (!colorMatchResult) return;
    let [, customColor, colorIndex] = colorMatchResult;
    let color = customColor ?? nodeColorList[colorIndex % nodeColorList.length];

    // Label and position
    const moreInfoFormat = /((?<label>[a-zA-Z0-9]{1,2})(?<pos>[a-zA-Z0-9]{2}))(-(?<highlights>.+))?/i
    let moreInfoResult = moreInfo.match(moreInfoFormat);
    if (!moreInfoResult) return;
    let label = moreInfoResult.groups.label
    let serializedPos = moreInfoResult.groups.pos
    let serializedHighlights = moreInfoResult.groups.highlights

    // Highlights
    let highlights;
    if (serializedHighlights != null) {
        highlights = HighlightsHandler.deserialize(serializedHighlights)
    }

    let [relativeX, relativeY] = decodePosition(serializedPos);
    let xPos = relativeX * canvas.width;
    let yPos = relativeY * canvas.height;

    return new Node({
                        x: xPos, y: yPos, label, index, color, highlights
                    });
}