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
    remove(highlight) {
        if (this.has(highlight) == false && highlight != HighlightType.SELECTION) {
            if (this.debug) console.warn(`Destaque ${highlight} já não está presente.`)
        }
        this.highlights.delete(highlight)
    }

    has(highlight) {
        return this.highlights.has(highlight);
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