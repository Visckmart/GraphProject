export default class AlgorithmInputHandler {
    constructor(controller) {
        this._controller = controller
        this.graphView = controller.graphView
        this.canvas = controller.graphView.canvas

        // Requisitos
        this._requirements = []

        // Eventos de input
        document.addEventListener("keydown", (event) => this.handleKeydown(event))

        this.initializeControls()
    }

    // Inicializa as funcionalidades dos elementos HTML dos controles
    initializeControls() {
        this._controller.playButton.addEventListener("click", () => {
            this._controller.playing = true
        })
        this._controller.stopButton.addEventListener("click", () => {
            this._controller.playing = false
        })

        this._controller.forwardButton.addEventListener("click", () => {
            this._controller.playing = false
            this._controller.progress += 1
        })

        this._controller.backButton.addEventListener("click", () => {
            this._controller.playing = false
            this._controller.progress -= 1
        })

        this._controller.exitButton.addEventListener("click", () => this._controller.finish())

        this._controller.progressBar.addEventListener("change", () => {
            this._controller.playing = false
            this._controller.progress = this._controller.progressBar.value
        })
        this._controller.progressBar.addEventListener("input", () => {
            this._controller.playing = false
            this._controller.progress = this._controller.progressBar.value
        })

        this._controller.speedUpButton.addEventListener("click", () => {
            this._controller.speed++
        })
        this._controller.speedDownButton.addEventListener("click", () => {
            this._controller.speed--
        })
    }

    // Funções helpers
    // TODO: Copiada do GraphMouseInteraction, talvez valha a pena achar um jeito de compartilhar o código entre eles
    getMousePos(canvas, mouseEvent) {
        var canvasRect = canvas.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - canvasRect.left,
            y: mouseEvent.clientY - canvasRect.top
        };
    }

    changeCursorStyle(style) {
        this.canvas.style.cursor = style;
    }

    handleKeydown(event) {
        let keyPressed = event.key
        console.log(keyPressed)

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
            case ' ':
                this._controller.playing = !this._controller.playing
        }
    }

}