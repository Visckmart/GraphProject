import UndirectedGraph from "../../Structure/UndirectedGraph.js";


class Step {
    constructor(graph, message = "") {
        this.graphState = graph.clone()
        this.message = message
    }
}

class AlgorithmController {
    constructor(graphView, steps = []) {
        this.steps = []
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

        this.initializeControls()

        this.progress = 0
        this.hide()
    }

    get numberOfSteps() {
        return this.steps.length
    }

    //#region Comportamento de progresso
    // Etapa atual
    _progress = 0
    get progress() {
        return this._progress
    }
    set progress(value) {
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

    // Inicializa as funcionalidades dos elementos HTML dos controles
    initializeControls() {
        this.playButton.addEventListener("click", () => {
            this.playButton.style.display = this.playButton.style.display === 'none' ? 'block' : 'none'
            this.stopButton.style.display = this.stopButton.style.display === 'none' ? 'block' : 'none'

            this.playing = true
        })
        this.stopButton.addEventListener("click", () => {
            this.playing = false
        })

        this.forwardButton.addEventListener("click", () => {
            this.playing = false
            this.progress += 1
        })

        this.backButton.addEventListener("click", () => {
            this.playing = false
            this.progress -= 1
        })

        this.exitButton.addEventListener("click", () => this.finish())

        this.progressBar.addEventListener("change", () => {
            this.playing = false
            this.progress = this.progressBar.value
        })
        this.progressBar.addEventListener("input", () => {
            this.playing = false
            this.progress = this.progressBar.value
        })
    }

    // Esconde a barra de play
    hide() {
        this.container.style.display = 'none'
    }

    // Mostra a barra de play
    show() {
        this.container.style.display = 'flex'
    }

    // Adiciona uma nova etapa
    addStep(graph, message) {
        this.steps.push(new Step(graph, message))
        this.progressBar.setAttribute("max", (this.numberOfSteps - 1).toString())
    }

    // Inicializa a demonstração do algoritmo
    ready() {
        this.graphView.interactionHandler.mouse.disable()
        this.graphView.interactionHandler.keyboard.disable()

        document.querySelector(".toolTray").style.display = 'none'

        this.show()
        this.progress = 0
        this.playing = false
    }


    // Finaliza a demonstração do algoritmo
    finish () {
        this.graphView.interactionHandler.mouse.enable()
        this.graphView.interactionHandler.keyboard.enable()

        document.querySelector(".toolTray").style.display = 'unset'

        this.hide()
    }
}

export default AlgorithmController