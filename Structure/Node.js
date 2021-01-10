// Node Definition
export const nodeRadius = 14;
const totalBlinkingFrames = 30;
const nodeColorList = [
    // "#32E6BC", "#E6DD27", "#E67955", "#27E64D"
    // "#E9D879", "#32E6BA", "#E6DD27", "#E67855", "#27E64C"
    // "#2FD6AE", "#D6CE24", "#D6704F", "#27E64C"
    "dodgerblue", "limegreen", "deeppink",
    "mediumslateblue", "#8D6E63", "#FFA0A0", "#4FC3F7", "burlywood", "#FF7043"
]
var colorRotation = 0
var globalNodeIndex = 0

var usedLabels = new Set()

function generateNewRandomLetter() {
    let newRandomLetter;
    if (usedLabels.size < 26) {
        do {
            let randomCharCode = Math.floor(Math.random()*26)+65
            newRandomLetter = String.fromCharCode(randomCharCode)
        } while (usedLabels.has(newRandomLetter));
    } else {
        let randomCharCode = Math.floor(Math.random()*26)+65
        newRandomLetter = String.fromCharCode(randomCharCode)
    }
    return newRandomLetter;
}

export const NodeHighlightType = {
    SELECTION: 1,
    ALGORITHM_FOCUS: 2
}
export class Node {

    constructor(x, y, label) {
        this.pos = {x: x, y: y};

        this.index = globalNodeIndex++;
        let newRandomLabel = generateNewRandomLetter()
        usedLabels.add(newRandomLabel)
        this.randomLabel = newRandomLabel
        if (label != null) {
            this.label = label;
        } else {
            this.label = newRandomLabel;
        }
        this.highlight = 0;
        
        this._originalcolor = nodeColorList[colorRotation % nodeColorList.length];
        this._initialTime = window.performance.now();
        this.breatheSettings = {
            speed: 0.15,
            amplitude: 1.5,
            offset: -2.5
        }
        // this._isBlinking = false;
        // this._initialBlinkingTime = null;
        // this.expansion = 3;

        function getCurrentColor() {
            return this._originalcolor
            // ctx.fillStyle = this._originalcolor
        }
        Object.defineProperty(this, 'color', { get: getCurrentColor } );


        function getCurrentRadius() {
            let elapsedTime = window.performance.now() - this._initialTime;
            let speed = this.breatheSettings.speed
            let mult = this.breatheSettings.amplitude
            let offset = this.breatheSettings.offset
            if (this.highlight & NodeHighlightType.ALGORITHM_FOCUS) {
                speed = 0.2;
                mult = 2.5;
            }
            let expansion = Math.sin((elapsedTime / 100)*speed) * mult + offset
            return nodeRadius * 2 + expansion;
        }

        
        Object.defineProperty(this, 'radius', { get: getCurrentRadius } );
        colorRotation += 1;
    }

    addHighlight(type) {
        // Checa se já está adicionado
        if ((this.highlight & type) == false) {
            this.highlight |= type;
        }
    }

    removeHighlight(type) {
        // Checa se pode ser removido
        if (this.highlight & type) {
            this.highlight &= ~type;
        }
    }

    get isSelected() {
        return this.highlight & NodeHighlightType.SELECTION;
    }
}

// export {Node, NodeHighlightType}