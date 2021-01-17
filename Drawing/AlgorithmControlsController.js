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
        this.progressOutline = document.querySelector(".progressOutline")
        this.progressBar = document.querySelector(".progressBar")
        this.progressButton = document.querySelector(".progressButton")
        this.playButton = document.querySelector("#play_button")
        this.stopButton = document.querySelector("#stop_button")
        this.backButton = document.querySelector("#back_button")
        this.forwardButton = document.querySelector("#forward_button")


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
            let percentageProgress = `${(value/this.numberOfSteps) * 100}%`

            this.progressBar.style.width = percentageProgress
            this.progressButton.style.left = percentageProgress
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

        this.progressButton.addEventListener("mousedown", () => {
            this.playing = false

            this.container.style.cursor = 'grabbing'

            let dragListener = ({clientX}) => {
                let offsetX = clientX - this.progressBar.getBoundingClientRect().x
                let widthSteps = this.container.clientWidth/(this.numberOfSteps * 2 + 1)
                let step = 0;
                for(let offset=0;step<this.numberOfSteps*2;offset+=widthSteps)
                {
                    if(offset > offsetX)
                    {
                        break
                    }
                    step++
                }

                console.log(step)
                if(step === 1)
                {
                    this.progress = 0
                } else {
                    this.progress = Math.round((step/2) - 0.5)
                }
            }


            let mouseupListener = () => {
                this.playing = false
                this.container.style.cursor = 'default'
                this.container.removeEventListener("mouseup", mouseupListener)
                this.container.removeEventListener("mouseleave", mouseupListener)
                this.container.removeEventListener("blur", mouseupListener)
                this.container.removeEventListener("mousemove", dragListener)
            }
            this.container.addEventListener("mouseup", mouseupListener)
            this.container.addEventListener("mouseleave", mouseupListener)
            this.container.addEventListener("blur", mouseupListener)
            this.container.addEventListener("mousemove", dragListener)

        })

        this.container.addEventListener("mouseup", () => {
            this.playing = false

            this.container.style.cursor = 'default'
        })
    }
}

export default AlgorithmControlsController