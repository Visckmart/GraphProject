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

// Cores e gradientes
export function colorFromComponents(r, g, b, a = 1) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}


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

export function isTouchEnvironment() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}
export function isLeftClick(mouseEvent)  {
    // console.log(mouseEvent instanceof TouchEvent);
    return isTouchEnvironment(mouseEvent) || (mouseEvent.button == 0);
}
export function isRightClick(mouseEvent) { return mouseEvent.button == 2; }
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