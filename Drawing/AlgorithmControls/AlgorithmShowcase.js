/*
* Classe base para um showcase
* Utilizado para visualizar estruturas auxiliares
 */
export default class AlgorithmShowcase {
    constructor() {
        this.canvas = document.getElementById('showcase')
        this.ctx = this.canvas.getContext('2d')
    }

    _titleElement = document.getElementById('showcaseTitle')
    set showcaseTitle(text) {
        this._titleElement.textContent = text
    }

    _messageElement = document.getElementById('showcaseMessage')
    set showcaseMessage(text) {
        this._messageElement.textContent = text
    }

    finish() {
        this.showcaseTitle = ''
        this.showcaseMessage = ''

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}