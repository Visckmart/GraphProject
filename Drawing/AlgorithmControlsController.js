class ProgressMarker extends HTMLDivElement {
    constructor() {
        super();
        this.className = "progressMarker"
    }
}

customElements.define('progress-marker', ProgressMarker, { extends: 'div'})

class AlgorithmControlsController {
    constructor(numberOfSteps) {
        this.numberOfSteps = numberOfSteps

        // Capturando elementos do HTML
        this.container = document.querySelector(".algorithmControls")
        this.progressBar = document.querySelector(".algorithmProgress")
        this.playButton = document.querySelector("#play_button")
        this.stopButton = document.querySelector("#stop_button")
        this.backButton = document.querySelector("#back_button")
        this.forwardButton = document.querySelector("#forward_button")

        this.progressBar.setAttribute("min", 0)
        this.progressBar.setAttribute("max", numberOfSteps)

        this.initializeControls()

        // Adiciona os markers de progresso
        for(let i=0;i<numberOfSteps - 1;i++)
        {
            let marker = document.createElement("div", { is: 'progress-marker'})
            this.progressOutline.appendChild(marker)
        }

        this.progress = 0
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
    }
}

export default AlgorithmControlsController