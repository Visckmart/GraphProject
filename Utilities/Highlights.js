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


export const HighlightType = {
    SELECTION:            "selection",
    DARK_WITH_BLINK:      "algorithm_focus",
    LIGHTEN:              "algorithm_focus2",
    ALGORITHM_VISITING:   "algorithm_visiting",
    DARKEN:               "algorithm_visited",
    DISABLED: "algorithm_notvisited",
    COLORED_A:       "algorithm_result",
    FEATURE_PREVIEW:      "feature_preview",
    COLORED_BORDER2: "cb2"
}

// export const NodeHighlight = {
//     SELECTION:            ["selection"],
//
//     COLORED_BORDER:       function (color) { return ["border", color]; },
//
//     BLINK_COLORED:        function (color, speed = 1) { return ["blink", color, speed]; },
//     BLINK_DARK:           ["blink", "black", 1],
//
//     OVERLAY_COLORED:      function (color) { return ["overlay", color]; },
//     OVERLAY_LIGHT:        ["overlay", "white"],
//     OVERLAY_DARK:         ["overlay", "black"],
//
//     DISABLED:             ["disabled"]
// }

export const NodeHighlight = {
    selection:          ["selection"],

    borderWithColor:    function (color) {
                            if (color == undefined) { return "border"; }
                            return ["border", color];
                        },

    blinkWithColor:     function (color, speed = 1) {
                            if (color == undefined) { return "blink"; }
                            return ["blink", color, speed];
                        },
    blinkToDark:        ["blink", "black", 1],

    overlayWithColor:   function (color) {
                            if (color == undefined) { return "overlay"; }
                            return ["overlay", color];
                        },
    overlayLight:       ["overlay", "white"],
    overlayDark:        ["overlay", "black"],

    disabled:           ["disabled"]
}

const highlightNames = Object.entries(HighlightType)
                        .map(entry => entry[1])
                        .flat()

const filteredOutHighlights = [
    HighlightType.SELECTION,
]

export class HighlightsHandler {

    constructor(highlights = null) {
        this.highlights = highlights == null ? new Set() : highlights;
        this.debug = false;
    }

    //region Manipulação dos Destaques

    add(highlight) {
        if (this.has(highlight) && highlight != HighlightType.SELECTION) {
            if (this.debug) console.warn(`Destaque ${highlight} já está presente.`)
        }
        this.highlights.add(highlight);
    }

    setTo(highlight) {
        this.highlights.clear()
        this.highlights.add(highlight)
    }

    remove(highlightType) {
        if (this.has(highlightType) == false && highlightType != HighlightType.SELECTION) {
            if (this.debug) console.warn(`Destaque ${highlightType} já não está presente.`)
        }

        let removed = this.highlights.delete(highlightType) != null;
        if (removed) { return; }

        for (let highlightInfo of this.highlights) {
            if (highlightType == highlightInfo[0])
                this.highlights.delete(highlightInfo)
        }
    }

    has(highlightType) {
        if (this.highlights.has(highlightType)) { return true; }
        for (let highlightInfo of this.highlights) {
            if (highlightType == highlightInfo[0]) { return true; }
        }
        return false;
    }

    getColor(highlightType) {
        for (let highlightInfo of this.highlights) {
            if (highlightInfo[0] == highlightType && highlightInfo.length > 1) {
                let infoCopy = [...highlightInfo];
                infoCopy.shift();
                return infoCopy;
            }
        }
    }

    clear() {
        this.highlights = new Set()
    }

    get length() {
        return this.highlights.size;
    }
    *list() {
        for (let highlight of this.highlights) {
            yield highlight;
        }
    }
    //endregion

    //region Serialização

    prepareForSharing() {
        let highlightsCopy = new Set(this.highlights);
        for (let highlight of filteredOutHighlights) {
            highlightsCopy.delete(highlight)
        }

        let serializedHighlights = Array.from(highlightsCopy)
                                    .map(hName => highlightNames.indexOf(hName))
                                    .filter(hNum => hNum != -1)
                                    .join("_");
        return serializedHighlights;
    }

    static deserialize(serializedHighlights) {
        // console.log("Deserializing", serializedHighlights.length, serializedHighlights, serializedHighlights, serializedHighlights.split("_"));
        if (serializedHighlights == null || serializedHighlights.length <= 0) {
            return null;
        }
        let namedHighlights = serializedHighlights
                                .split("_")
                                .map(hNum => highlightNames[hNum]);
        return new Set(namedHighlights);
    }
    //endregion
}