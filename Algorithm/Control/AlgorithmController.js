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

import AlgorithmInputHandler from "./AlgorithmInputHandler.js";
import { Requirement } from "./AlgorithmRequirements.js";
import AlgorithmPseudocode from "../../Drawing/AlgorithmVisualizations/Pseudocode/AlgorithmPseudocode.js";
import AlgorithmMenu from "./AlgorithmMenu.js";


class Step {
    constructor(graph, message = "", pseudoLabel, isWarning, isHighlight) {
        this.graphState = graph.clone()
        this.message = message
        this.pseudoLabel = pseudoLabel
        this.isWarning = isWarning
        this.isHighlight = isHighlight
    }
}

class AlgorithmController {
    constructor(graphView, steps = []) {
        this.steps = steps
        this.requirements = []

        this.graphView = graphView
        this.initialGraph = graphView.structure.clone()

        this.originalCanvasSize = [this.graphView.canvas.width, this.graphView.canvas.height]

        // Instanciando handler de inputs
        this.inputHandler = new AlgorithmInputHandler(this)

        this.inputHandler.progressBar.setAttribute("min", "0")
        this.inputHandler.progressBar.setAttribute("max", this.numberOfSteps.toString())

        this.progress = 0
        this.speed = 0
        this.hide()
    }

    get numberOfSteps() {
        return this.steps.length
    }

    //#region Comportamento de bloqueio
    //Status de bloqueio
    _isBlocked = false

    get isBlocked() {
        return this._isBlocked
    }
    set isBlocked(value) {
        this._isBlocked = value
        if(value) {
            this.inputHandler.speedRange.setAttribute("disabled", "true")
            this.inputHandler.progressBar.setAttribute("disabled", "true")
            this.inputHandler.executionContainer.setAttribute("disabled", "true")
        } else {
            this.inputHandler.speedRange.removeAttribute("disabled")
            this.inputHandler.progressBar.removeAttribute("disabled")
            this.inputHandler.executionContainer.removeAttribute("disabled")
        }
    }
    //#endregion

    //#region Comportamento de destaque de mensagem
    //Status de destaque
    _messageIsHighlighted = false

    set messageIsHighlighted(value) {
        this._messageIsHighlighted = value
        if(value) {
            this.inputHandler.tutorialContainer.setAttribute("highlighted", "true")
        } else {
            this.inputHandler.tutorialContainer.removeAttribute("highlighted")
        }
    }
    //#endregion

    //#region Comportamento de destaque de mensagem
    //Status de destaque
    _messageIsWarning = false

    set messageIsWarning(value) {
        this._messageIsWarning = value
        if(value) {
            this.inputHandler.tutorialContainer.setAttribute("warning", "true")
        } else {
            this.inputHandler.tutorialContainer.removeAttribute("warning")
        }
    }
    //#endregion

    //#region Comportamento de mensagem opcional
    _messageIsOptional = false

    set messageIsOptional (value) {
        this._messageIsOptional = value

        if(value) {
            this.inputHandler.tutorialContainer.setAttribute("optional", "true")

            let skipMethod = () => {
                this._currentRequirement?.skipRequirement()
                this.inputHandler.tutorialContainer.removeEventListener('click', skipMethod)
            }

            this.inputHandler.tutorialContainer.addEventListener('click', skipMethod)
        } else {
            this.inputHandler.tutorialContainer.removeAttribute("optional")
        }
    }
    //#endregion

    adjustNodePositions() {
        let widthMult = this.graphView.canvas.width/this.originalCanvasSize[0];
        let heightMult = this.graphView.canvas.height/this.originalCanvasSize[1];

        for (let node of this.graphView.structure.nodes()) {
            node.pos.x *= widthMult;
            node.pos.y *= heightMult;
        }
    }
    //#region Comportamento de progresso
    // Etapa atual
    _progress = 0
    get progress() {
        return this._progress
    }
    set progress(value) {
        if(this.isBlocked){
            return
        }

        if(value === this.numberOfSteps - 1)
        {
            this.playing = false
        }

        if(value >= 0 && value < this.numberOfSteps)
        {
            this._progress = value
            this.inputHandler.progressBar.value = value
            this.inputHandler.redrawSliderBackground(this.inputHandler.progressBar)

            // Passando a informação do step atual para o showcase
            this.showcasing?.loadStep(value)

            // Se a etapa atual é válida atualiza o grafo sendo mostrado
            if(this.steps[value])
            {
                if(this.steps[value].message)
                {
                    this.inputHandler.tutorialContainer.style.display = ''
                    this.inputHandler.message.innerHTML = this.steps[value].message

                    if(this.pseudocode && this.steps[value].pseudoLabel)
                    {
                        this.pseudocode.current = this.steps[value].pseudoLabel
                    }

                    this.messageIsWarning = this.steps[value].isWarning
                    this.messageIsHighlighted = this.steps[value].isHighlight
                } else {
                    this.inputHandler.tutorialContainer.style.display = 'none'
                }
                let newState = this.steps[value].graphState.clone()
                this.graphView.structure = newState
                // this.adjustNodePositions()
                this.graphView.refreshGraph()
            }
        }
    }
    //#endregion

    //#region Comportamento de reprodução
    // Status de reprodução
    _playing = false
    _interval = null
    get playing() {
        return this._playing
    }
    set playing(value) {
        if(this.isBlocked){
            return
        }
        this._playing = value

        if(value) {
            this.inputHandler.playButton.style.display = 'none'
            this.inputHandler.stopButton.style.display = 'flex'

            if(this.progress === this.numberOfSteps - 1) {
                this.progress = 0
            }

            if(!this._interval)
            {
                this._interval = setInterval(() => {
                    this.progress++
                }, 1000 / this.speedMultiplier)
            }
        }
        else {
            this.inputHandler.playButton.style.display = 'flex'
            this.inputHandler.stopButton.style.display = 'none'
            if(this._interval)
            {
                clearInterval(this._interval)
                this._interval = null
            }
        }
    }
    //#endregion

    //#region Comportamento de velocidade de reprodução
    // Velocidade de reprodução
    // Valor de -3 a 3. -3 implica em um multiplicador 1/(2^3) e 3 implica em um multiplicador 2^3
    _speed = 0
    get speed() {
        return this._speed
    }
    get speedMultiplier() {
        return 2 ** this.speed
    }
    set speed(value) {
        if(this.isBlocked)
        {
            return
        }
        if(value >= -4 && value <= 4) {
            this._speed = value
            this.inputHandler.speedRange.value = value
            this.inputHandler.redrawSliderBackground(this.inputHandler.speedRange)
            if(this.playing)
            {
                clearInterval(this._interval)
                this._interval = null
                this.playing = true
            }

            this.inputHandler.speedGauge.textContent = this.speedMultiplier + "x"
        }
    }
    //#endregion

    //#region Comportamento de showcase
    _showcasing = null
    get showcasing() {
        return this._showcasing
    }
    set showcasing(showcase) {
        this._showcasing = showcase
        if(showcase) {
            this.inputHandler.showcase.style.display = ''
            this.inputHandler.showcaseTab.style.display = ''

            if(!this.menuHandler) {
                this.menuHandler = new AlgorithmMenu()
            }
        } else {
            this.inputHandler.showcase.style.display = 'none'
            this.inputHandler.showcaseTab.style.display = 'none'
            this.showcasing?.finish?.()
        }
    }
    //#endregion

    //#region Comportamento de pseudo-código
    setPseudocode(code) {
        let request = new XMLHttpRequest()
        request.addEventListener('load', (response) => {
            // if(request.status === 200) {
                this.pseudocode = new AlgorithmPseudocode(request.response)
            // }
            // else {
            //     console.warn(request.status);
            //     console.warn(response);
            //     throw Error("Pseudo-código não pode ser recuperado.")
            // }
            if(!this.menuHandler) {
                this.menuHandler = new AlgorithmMenu()
            }
        })
        request.open("GET", code)
        request.send()
        // console.warn("2",request.status);
    }
    //#endregion
    // Esconde a barra de play
    hide() {
        this.inputHandler.controls.style.display = 'none'
    }

    // Mostra a barra de play
    show() {
        this.inputHandler.controls.style.display = ''
    }

    // Adiciona um novo requisito
    addRequirement(type, message, callback, isOptional=false) {
        let requirement = new Requirement(this.inputHandler, type, message, callback, isOptional)
        this.requirements.push(requirement)
    }

    // Adiciona uma nova etapa
    addStep(graph, message, pseudoLabel = null, isWarning = false, isHighlighted = false) {
        this.steps.push(new Step(graph, message, pseudoLabel, isWarning, isHighlighted))
        this.inputHandler.progressBar.setAttribute("max", (this.numberOfSteps - 1).toString())

        this.showcasing?.addStep()
    }

    _currentRequirement = null
    async resolveRequirements() {
        this.isBlocked = true
        this.messageIsWarning = true
        while(this.requirements.length > 0) {
            this._currentRequirement = this.requirements.shift()
            this.messageIsWarning = false
            this.messageIsHighlighted = true
            this.messageIsOptional = this._currentRequirement?.optional

            this.inputHandler.message.innerHTML = this._currentRequirement?.message
            await this._currentRequirement?.resolve()
        }
        this.messageIsHighlighted = false
        this.messageIsWarning = false
        this.messageIsOptional = false
        this.isBlocked = false
        this._currentRequirement = null
    }

    enabledInputs = null;
    // Inicializa a preparação do algoritmo
    async setup (algorithm) {
        // console.warn("Starting")
        this.graphView.mouseHandler.disable()
        this.graphView.keyboardHandler.disable()

        for (let tray of document.getElementsByClassName("toolTray")) {
            tray.style.display = 'none';
        }
        this.show()
        this.playing = false
        let inputElements = document.getElementById("menuArea").getElementsByTagName("input")
        this.enabledInputs = Array.from(inputElements).map(element => [element, element.disabled])
        for (let [input, ] of this.enabledInputs) {
            input.disabled = true
        }
        // TODO: Organizar
        let menuArea = document.getElementById("menuArea");
        menuArea.style.display = "none";
        // menuArea.style.width = "0";
        let canvasArea = document.getElementById("canvasArea");
        canvasArea.style.width = "100%";
        this.adjustNodePositions()
        this.graphView.recalculateLayout()
        this.graphView.redrawGraph()
        await algorithm(this)
        this.ready()
    }

    // Inicializa a demonstração do algoritmo
    ready() {
        if(this._finished) {
            return
        }

        this.graphView.redrawGraph()
        this.playing = true
        this.progress = 0
        this.isBlocked = false
    }


    // Finaliza a demonstração do algoritmo
    _finished = false
    finish () {
        this._finished = true

        this.graphView.mouseHandler.enable()
        this.graphView.keyboardHandler.enable()

        for (let tray of document.getElementsByClassName("toolTray")) {
            tray.style.removeProperty("display");
        }
        // TODO: Organizar
        let menuArea = document.getElementById("menuArea");
        menuArea.style.removeProperty("display")
        menuArea.style.removeProperty("width")
        let canvasArea = document.getElementById("canvasArea");
        canvasArea.style.removeProperty("width")

        for (let [input, originalState] of this?.enabledInputs ?? []) {
            input.disabled = originalState
        }
        this.hide()
        this.playing = false
        this.showcasing = false
        this.messageIsHighlighted = false
        this.messageIsWarning = false

        // Pulando requirement atual para evitar disparo posterior
        this._currentRequirement?.skipRequirement()


        this.inputHandler?.finish()
        this.menuHandler?.finish()
        this.pseudocode?.finish()

        // TODO: Revisitar os ajustes de posição dos nós ao entrar e sair da
        //       execução de um algoritmo.

        // Restaurando grafo ao estado inicial
        this.graphView.recalculateLayout()
        this.graphView.structure = this.initialGraph
        this.graphView.refreshGraph()
        this.adjustNodePositions()
    }
}

export default AlgorithmController