import {canvas, ctx} from "../Drawing/General.js";

// Cores e gradientes
export function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

export const backgroundGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
backgroundGradient.addColorStop(0, "#E5E0FF");
backgroundGradient.addColorStop(1, "#FFE0F3");


// Gerando letras aleatórias
let usedLabels = new Set()

export function generateNewRandomLetter() {
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
    usedLabels.add(newRandomLetter);
    return newRandomLetter;
}

// function drawPreservingState(ctx, drawingOperations) {
//     ctx.save()
//     drawingOperations()
//     ctx.restore()
// }


// Serialização

const uppercaseLetters = Array.from({length: 26}, (_, i) => String.fromCharCode(65+i));
const lowercaseLetters = Array.from({length: 26}, (_, i) => String.fromCharCode(97+i));
const numbers = Array.from({length: 10}, (_, i) => String.fromCharCode(48+i));

export const positionAlphabet = uppercaseLetters.concat(lowercaseLetters.concat(numbers))