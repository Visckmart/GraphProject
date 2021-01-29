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
        this.controls = document.querySelector("#algorithmControls")
        this.container = document.getElementById("algorithmContainer")
        this.messageContainer = document.querySelector("#messageTray")
        this.message = document.querySelector("#messageTrayText")
        this.progressBar = document.querySelector("#algorithmProgress")
        this.playButton = document.querySelector("#play_button")
        this.stopButton = document.querySelector("#stop_button")
        this.backButton = document.querySelector("#back_button")
        this.forwardButton = document.querySelector("#forward_button")
        this.exitButton = document.querySelector("#exit_button")

        this.progressBar.setAttribute("min", "0")
        this.progressBar.setAttribute("max", this.numberOfSteps.toString())


        // Instanciando handler de inputs
        this.inputHandler = new AlgorithmInputHandler(this)

        this.progress = 0
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
            this.progressBar.setAttribute("disabled", "true")
            this.container.setAttribute("disabled", "true")
        } else {
            this.progressBar.removeAttribute("disabled")
            this.container.removeAttribute("disabled")
        }
    }
    //#endregion

    //#region Comportamento de destaque de mensagem
    //Status de destaque
    _messageIsHighlighted = false

    set messageIsHighlighted(value) {
        this._messageIsHighlighted = value
        if(value) {
            this.message.setAttribute("highlighted", "true")
        } else {
            this.message.removeAttribute("highlighted")
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

        if(value >= 0 && value < this.numberOfSteps)
        {
            this._progress = value
            this.progressBar.value = value

            // Se a etapa atual é válida atualiza o grafo sendo mostrado
            if(this.steps[value])
            {
                if(this.steps[value].message)
                {
                    this.messageContainer.style.display = 'block'
                    this.message.textContent = this.steps[value].message
                } else {
                    this.messageContainer.style.display = 'none'
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
                        this.playing = false
                    }
                }, 1000)
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

        this._playing = value
    }
    //#endregion

    // Esconde a barra de play
    hide() {
        this.controls.style.display = 'none'
    }

    // Mostra a barra de play
    show() {
        this.controls.style.display = 'flex'
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
            let requirement = this.requirements.pop()
            this.message.textContent = requirement.message
            await requirement.handle()
        }
        if(this.steps.length > 0)
        {
            this.message.textContent = this.steps[0].message
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
        this.progress = 0

        await algorithm(this)
    }

    // Inicializa a demonstração do algoritmo
    ready() {
        this.playing = false
        this.progress = 0
        this.graphView.redrawGraph()
    }


    // Finaliza a demonstração do algoritmo
    finish () {
        this.graphView.interactionHandler.mouse.enable()
        this.graphView.interactionHandler.keyboard.enable()

        document.querySelector(".toolTray").style.display = 'unset'

        this.hide()
        this.graphView.structure.debug = true

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