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

export default class HistoryTracker {
    // Lista de grafos com cada passo relevante
    steps = [];
    // Marcador do passo atual
    cursor = -1;

    didChange = null;
    // Avança o marcador e armazena um novo passo
    registerStep(newStep) {
        // Anda com o marcador
        this.cursor += 1;
        // Apaga todos os passos posteriores
        this.steps.splice(this.cursor);
        // Armazena o passo atual
        this.steps[this.cursor] = newStep.clone();

        this.didChange(true);
    }

    getCurrentStep() {
// Retorna o passo solicitado
        return this.steps[this.cursor].clone();
    }

    // Move o marcador como solicitado e retorna o conteúdo do passo
    goToStep(relativePosition) {
        // Anda com o marcador
        let newCursorPos = this.cursor + relativePosition;

        // Não permite o marcador sair dos limites
        if (newCursorPos < 0 || newCursorPos > this.steps.length-1) {
            return false;
        }

        this.cursor = newCursorPos;
        this.didChange(false);
        return true;
    }
}