import {canvas, nodeColorList} from "../Drawing/General.js";
import {HighlightsHandler} from "./Highlights.js";
import {positionAlphabet} from "./Utilities.js";
import Node from "./Node.js"

export function serializeNode() {
    // Colors
    let serializedColors;
    let indexOfColor = nodeColorList.indexOf(this._originalcolor)
    if (indexOfColor) {
        serializedColors = this._originalcolor.slice(1)
    } else {
        serializedColors = indexOfColor;
    }

    // Position
    let percX = Math.round((this.pos.x / canvas.width)*61);
    let percY = Math.round((this.pos.y / canvas.height)*61);
    let serializedPosition = `${positionAlphabet[percX]}${positionAlphabet[percY]}`

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
    // console.log(serializedNode, matchResult)
    if (!matchResult) return;
    let [, index, serializedColor, moreInfo] = matchResult;
    index = parseInt(index)
    // console.log("index", index)

    let colorMatchResult = serializedColor.match(/([a-fA-F0-9]{6})|(\d+)/i);
    if (!colorMatchResult) return;
    let [, customColor, colorIndex] = colorMatchResult;
    let color = customColor ?? nodeColorList[colorIndex % nodeColorList.length];
    // console.log("color", color)

    const moreInfoFormat = /((?<label>[a-zA-Z0-9]{1,2})(?<pos>[a-zA-Z0-9]{2}))(-(?<highlights>.+))?/i
    let moreInfoResult = moreInfo.match(moreInfoFormat);
    if (!moreInfoResult) return;

    let label = moreInfoResult.groups.label
    let serializedPos = moreInfoResult.groups.pos
    let serializedHighlights = moreInfoResult.groups.highlights
    // console.log("label", label)
    // console.log("pos", serializedPos)
    let highlights;
    if (serializedHighlights != null) {
        highlights = HighlightsHandler.deserialize(serializedHighlights)
    }

    let xPos = positionAlphabet.indexOf(serializedPos.charAt(0))
    let yPos = positionAlphabet.indexOf(serializedPos.charAt(1))
    if (xPos == null || yPos == null) return;
    xPos *= canvas.width/61;
    yPos *= canvas.height/61;

    return new Node({
                        x: xPos, y: yPos, label, index, color, highlights
                    });
}