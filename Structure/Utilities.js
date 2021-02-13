import { canvas, ctx } from "../Drawing/General.js";
import { g } from "../Drawing/GraphView.js";
import { categoryCheckboxes } from "../Drawing/Interaction.js";

export function refreshInterfaceCategories() {
    let categoriesState = g.structure.getCategories()
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        checkbox.checked = categoriesState[category];
    }
}

// Cores e gradientes
export function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

export const backgroundGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
backgroundGradient.addColorStop(0, "#E5E0FF");
backgroundGradient.addColorStop(1, "#FFE0F3");


// Gerando letras aleatórias
let usedLabels = new Set()

function generateRandomLetter() {
    return String.fromCharCode(Math.floor(Math.random()*26)+65);
}

export function generateNewRandomLabel() {
    let newRandomLabel;
    do {
        newRandomLabel = generateRandomLetter();
    } while (usedLabels.size < 26 && usedLabels.has(newRandomLabel));

    usedLabels.add(newRandomLabel);
    return newRandomLabel;
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


export function getDistanceOf(A, B) {
    return Math.sqrt(Math.pow(Math.abs(B.x-A.x), 2) + Math.pow(Math.abs(B.y-A.y), 2))
}

export function getFormattedTime() {
    const hoje = new Date()
    const ano = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(hoje);
    const mes = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(hoje);
    const dia = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(hoje);
    const hora = new Intl.DateTimeFormat('en', { hour12: false, hour: '2-digit' }).format(hoje);
    const minuto = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(hoje);

    return `${dia}-${mes}-${ano} ${hora}:${minuto}`
}