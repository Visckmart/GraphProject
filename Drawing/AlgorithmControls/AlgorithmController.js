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
        this.container = document.querySelector(".algorithmControls")
        this.messageContainer = document.querySelector(".messageTray")
        this.message = document.querySelector(".messageTrayText")
        this.progressBar = document.querySelector(".algorithmProgress")
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

    //Status de bloqueio
    _blocked = false

    get blocked() {
        return this._blocked
    }
    set blocked(value) {
        this._blocked = value
        if(value) {
            this.progressBar.setAttribute("disabled", "true")
        } else {
            this.progressBar.removeAttribute("disabled")
        }
    }


    //#region Comportamento de progresso
    // Etapa atual
    _progress = 0
    get progress() {
        return this._progress
    }
    set progress(value) {
        if(this.blocked){
            return
        }

        if(value >= 0 && value <= this.numberOfSteps)
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
        if(this.blocked){
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
        this.container.style.display = 'none'
    }

    // Mostra a barra de play
    show() {
        this.container.style.display = 'flex'
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
        this.blocked = true
        for(let requirement of this.requirements) {
            this.message.textContent = requirement.message
            await requirement.handle()
        }
        if(this.steps.length > 0)
        {
            this.message.textContent = this.steps[0].message
        }
        this.blocked = false
    }

    // Inicializa a demonstração do algoritmo
    async ready() {
        this.graphView.interactionHandler.mouse.disable()
        this.graphView.interactionHandler.keyboard.disable()

        document.querySelector(".toolTray").style.display = 'none'

        this.show()
        this.playing = false
        await this.resolveRequirements()
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