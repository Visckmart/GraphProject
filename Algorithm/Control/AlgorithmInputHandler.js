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

export default class AlgorithmInputHandler {
    constructor(controller) {
        this._controller = controller
        this.graphView = controller.graphView
        this.canvas = controller.graphView.canvas

        // Capturando elementos do HTML
        this.controls = document.getElementById("algorithmController")
        this.executionContainer = document.getElementById("executionContainer")
        this.tutorialContainer = document.getElementById("tutorialContainer")
        this.message = document.querySelector("#tutorialContainer > label > span")
        this.speedGauge = document.getElementById("speedGauge")
        this.speedRange = document.getElementById("speedInput")
        this.progressBar = document.getElementById("timelineInput")
        this.playButton = document.getElementById("play_button")
        this.stopButton = document.getElementById("stop_button")
        this.backButton = document.getElementById("back_button")
        this.forwardButton = document.getElementById("forward_button")
        this.exitButton = document.getElementById("exit_button")

        // Menus e abas
        this.showcase = document.getElementById("algorithmShowcase")
        this.showcaseTab = document.getElementById("showcaseTab")

        // Requisitos
        this._requirements = []

        // Eventos de input
        document.addEventListener("keydown", this.handleKeydown)

        this.initializeControls()
    }

    // Inicializa as funcionalidades dos elementos HTML dos controles
    initializeControls() {
        this._playButtonHandler = () => {
            this._controller.playing = true
        }
        this.playButton.addEventListener("click", this._playButtonHandler)

        this._stopButtonHandler = () => {
            this._controller.playing = false
        }
        this.stopButton.addEventListener("click", this._stopButtonHandler)

        this._forwardButtonHandler = () => {
            this._controller.playing = false
            this._controller.progress += 1
        }
        this.forwardButton.addEventListener("click", this._forwardButtonHandler)

        this._backButtonHandler = () => {
            this._controller.playing = false
            this._controller.progress -= 1
        }
        this.backButton.addEventListener("click", this._backButtonHandler)

        this._exitButtonHandler = () => this._controller.finish()
        this.exitButton.addEventListener("click", this._exitButtonHandler)

        this._progressBarHandler = () => {
            this._controller.playing = false
            this._controller.progress = Number.parseInt(this.progressBar.value)
        }
        this.progressBar.addEventListener("input",  this._progressBarHandler)

        this._speedHandler = () => {
            this._controller.speed = Number.parseInt(this.speedRange.value)
            this.redrawSliderBackground(this.speedRange)
        }
        this.speedRange.addEventListener("input", this._speedHandler)
    }

    // Funções helpers
    // TODO: Copiada do GraphMouseInteraction, talvez valha a pena achar um jeito de compartilhar o código entre eles
    getMousePos(canvas, mouseEvent) {
        let canvasRect = canvas.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - canvasRect.left,
            y: mouseEvent.clientY - canvasRect.top
        };
    }

    changeCursorStyle(style) {
        this.canvas.style.cursor = style;
    }

    handleKeydown = (event) => {
        let keyPressed = event.key
        // console.log(keyPressed)

        switch (keyPressed) {
            case 'Left':
            case 'ArrowLeft':
                this._controller.playing = false
                this._controller.progress -= 1
                break
            case 'Right':
            case 'ArrowRight':
                this._controller.playing = false
                this._controller.progress += 1
                break
            case 'Up':
            case 'ArrowUp':
                this._controller.speed++
                break
            case 'Down':
            case 'ArrowDown':
                this._controller.speed--
                break
            case ' ':
                this._controller.playing = !this._controller.playing
                break;
            case 'Escape':
                this._controller.finish();
                break;
        }
    }

    redrawSliderBackground(inputElement) {
        let inputRange = inputElement.max - inputElement.min;
        let percentage = (inputElement.value - inputElement.min)/inputRange * 100;
        inputElement.style.background = `linear-gradient(to right,`
            + `#BBB 0%, `
            + `#BBB ${percentage}%, `
            + `#FFF ${percentage}%, `
            + `#FFF 100%`
            + `)`;
    }

    finish() {
        // Removendo handlers
        document.removeEventListener("keydown", this.handleKeydown)

        this.playButton.removeEventListener("click", this._playButtonHandler)
        this.stopButton.removeEventListener("click", this._stopButtonHandler)
        this.forwardButton.removeEventListener("click", this._forwardButtonHandler)
        this.backButton.removeEventListener("click", this._backButtonHandler)
        this.exitButton.removeEventListener("click", this._exitButtonHandler)
        this.progressBar.removeEventListener("input",  this._progressBarHandler)
        this.speedRange.removeEventListener("input", this._speedHandler)

        this.message.innerHTML = ''
    }

}