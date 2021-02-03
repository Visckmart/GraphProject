import UndirectedGraph from "../../Structure/UndirectedGraph.js";
import { NodeHighlightType } from "../../Structure/Node.js"
import AlgorithmInputHandler from "./AlgorithmInputHandler.js";
import {Requirement} from "./AlgorithmRequirements.js";


class Step {
    constructor(graph, message = "") {
        this.graphState = graph.clone()
        this.message = message
    }
}

class AlgorithmController {
    constructor(graphView, steps = []) {
        this.steps = []
        this.requirements = []

        this.graphView = graphView
        this.initialGraph = graphView.structure

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

        this.progressBar.setAttribute("min", "0")
        this.progressBar.setAttribute("max", this.numberOfSteps.toString())


        // Instanciando handler de inputs
        this.inputHandler = new AlgorithmInputHandler(this)

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
            this.speedRange.setAttribute("disabled", "true")
            this.progressBar.setAttribute("disabled", "true")
            this.executionContainer.setAttribute("disabled", "true")
        } else {
            this.speedRange.removeAttribute("disabled")
            this.progressBar.removeAttribute("disabled")
            this.executionContainer.removeAttribute("disabled")
        }
    }
    //#endregion

    //#region Comportamento de destaque de mensagem
    //Status de destaque
    _messageIsHighlighted = false

    set messageIsHighlighted(value) {
        this._messageIsHighlighted = value
        if(value) {
            this.tutorialContainer.setAttribute("highlighted", "true")
        } else {
            this.tutorialContainer.removeAttribute("highlighted")
        }
    }
    //#endregion

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
            this.progressBar.value = value

            // Se a etapa atual é válida atualiza o grafo sendo mostrado
            if(this.steps[value])
            {
                if(this.steps[value].message)
                {
                    this.tutorialContainer.style.display = 'block'
                    this.message.textContent = this.steps[value].message
                } else {
                    this.tutorialContainer.style.display = 'none'
                }
                this.graphView.structure = this.steps[value].graphState
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
            this.playButton.style.display = this.playButton.style.display = 'none'
            this.stopButton.style.display = this.stopButton.style.display = 'block'

            if(this.progress === this.numberOfSteps) {
                this.progress = 0
            }

            if(!this._interval)
            {
                this._interval = setInterval(() => {
                    this.progress++

                    if(this.progress === this.numberOfSteps)
                    {
                        //this.playing = false
                    }
                }, 1000 / this.speedMultiplier)
            }
        }
        else {
            this.playButton.style.display = this.playButton.style.display = 'block'
            this.stopButton.style.display = this.stopButton.style.display = 'none'
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
        console.log(value)
        if(value >= -4 && value <= 4) {
            this._speed = value

            if(this.playing)
            {
                clearInterval(this._interval)
                this._interval = null
                this.playing = true
            }

            this.speedGauge.textContent = this.speedMultiplier + "x"
            console.log(this.speedGauge.textContent)
        }
    }
    //#endregion

    // Esconde a barra de play
    hide() {
        this.controls.style.display = 'none'
    }

    // Mostra a barra de play
    show() {
        this.controls.style.display = 'block'
    }

    // Adiciona um novo requisito
    addRequirement(type, message, callback) {
        let requirement = new Requirement(this.inputHandler, type, message, callback)
        this.requirements.push(requirement)
    }

    // Adiciona uma nova etapa
    addStep(graph, message) {
        this.steps.push(new Step(graph, message))
        this.progressBar.setAttribute("max", (this.numberOfSteps - 1).toString())
    }

    async resolveRequirements() {
        this.isBlocked = true
        this.messageIsHighlighted = true
        while(this.requirements.length > 0) {
            let requirement = this.requirements.shift()
            this.message.textContent = requirement.message
            await requirement.resolve()
        }
        this.messageIsHighlighted = false
        this.isBlocked = false
    }

    // Inicializa a preparação do algoritmo
    async setup (algorithm) {
        this.graphView.interactionHandler.mouse.disable()
        this.graphView.interactionHandler.keyboard.disable()

        document.querySelector(".toolTray").style.display = 'none'
        this.show()
        this.playing = false
        await algorithm(this)
        this.ready()
    }

    // Inicializa a demonstração do algoritmo
    ready() {
        this.graphView.redrawGraph()
        this.playing = true
        this.progress = 0
    }


    // Finaliza a demonstração do algoritmo
    finish () {
        this.graphView.interactionHandler.mouse.enable()
        this.graphView.interactionHandler.keyboard.enable()

        document.querySelector(".toolTray").style.display = 'unset'

        this.hide()
        this.graphView.structure.debug = true
        this.playing = false

        // Remover os destaques
        for (let node of this.graphView.structure.nodes()) {
            node.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
            node.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
        }
        
        for (let [edge, , ] of this.graphView.structure.uniqueEdges()) {
            edge.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS)
            edge.removeHighlight(NodeHighlightType.ALGORITHM_FOCUS2)
        }
    }
}

export default AlgorithmController