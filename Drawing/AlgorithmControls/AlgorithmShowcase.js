export default class AlgorithmShowcase {
    constructor() {
        this.body = document.getElementById('showcaseBody')
    }

    _titleElement = document.getElementById('showcaseTitle')
    set showcaseTitle(value) {
        this._titleElement.textContent = value
    }

    finish() {
        this.body.innerHTML = ''
        this.showcaseTitle = ''
    }
}