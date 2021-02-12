export const HighlightType = {
    SELECTION:            "selection",
    DARK_WITH_BLINK:      "algorithm_focus",
    LIGHTEN:     "algorithm_focus2",
    ALGORITHM_VISITING:   "algorithm_visiting",
    DARKEN:    "algorithm_visited",
    ALGORITHM_NOTVISITED: "algorithm_notvisited",
    COLORED_BORDER:     "algorithm_result",
    FEATURE_PREVIEW:      "feature_preview"
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
    }

    debug = false;
    
    has(highlight) {
        return this.highlights.has(highlight);
    }

    add(highlight) {
        if (this.debug && this.has(highlight) && highlight != HighlightType.SELECTION) {
            console.warn(`Destaque ${highlight} já está presente.`)
            // console.trace()
        }
        this.highlights.add(highlight);
    }

    remove(highlight) {
        if (this.debug && this.has(highlight) == false && highlight != HighlightType.SELECTION) {
            console.warn(`Destaque ${highlight} já não está presente.`)
            // console.trace()
        }
        this.highlights.delete(highlight)
    }

    *list() {
        for (let highlight of this.highlights) {
            yield highlight;
        }
    }

    prepareForSharing() {
        let highlightsCopy = new Set(this.highlights);
        for (let highlight of filteredOutHighlights) {
            highlightsCopy.delete(highlight)
        }
        // noinspection UnnecessaryLocalVariableJS
        let serializedHighlights = Array.from(highlightsCopy)
                                    .map(hName => highlightNames.indexOf(hName))
                                    .filter(hNum => hNum != -1)
                                    .join("_")
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
}