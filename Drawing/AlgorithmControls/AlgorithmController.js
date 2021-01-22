import UndirectedGraph from "../../Structure/UndirectedGraph.js";

class AlgorithmController {
    constructor(graphView, steps = []) {
        this.steps = []
        this.graphView = graphView
        this.initialGraph = graphView.structure

        // Capturando elementos do HTML
        this.container = document.querySelector(".algorithmControls")
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

    // Progresso das etapas
    _progress = 0
    get progress() {
        return this._progress
    }
    set progress(value) {
        if(value >= 0 && value <= this.numberOfSteps)
        {
            this._progress = value
            this.progressBar.value = value
            if(this.steps[value])
            {
                this.graphView.structure = this.steps[value]
            }
        }
    }


    // Status de play
    _playing = false
    _interval = null
    get playing() {
        return false
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

    // Inicializa a funcionalidade dos controles
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

    hide() {
        this.container.style.display = 'none'
    }

    show() {
        this.container.style.display = 'flex'
    }

    get currentStep() {
        return this.steps[this.progress]
    }

    addStep(graph) {
        let clone = UndirectedGraph.deserialize(graph.serialize())
        this.steps.push(clone)
        this.progressBar.setAttribute("max", (this.numberOfSteps - 1).toString())
    }

    disableHandler (e) {
        e.stopPropagation()
        e.preventDefault()
    }

    ready() {
        this.graphView.interactionHandler.mouse.disable()
        this.graphView.interactionHandler.keyboard.disable()

        document.querySelector(".toolTray").style.display = 'none'

        this.show()
        this.progress = 0
        this.playing = true
    }

    finish () {
        this.graphView.interactionHandler.mouse.enable()
        this.graphView.interactionHandler.keyboard.enable()

        document.querySelector(".toolTray").style.display = 'unset'

        this.hide()
    }
}

export default AlgorithmController