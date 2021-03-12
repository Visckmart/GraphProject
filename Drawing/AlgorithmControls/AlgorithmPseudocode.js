export default class AlgorithmPseudocode {
    constructor(code, labels) {
        this.code = code
        this.labelMap = {}

        /* Capturando elementos do documento */
        this.wrapper = document.getElementById("pseudocode")
        this.container = document.getElementById("pseudoContainer")

        this.wrapper.style.display = 'unset'

        this.codeElements = []
        this._initCode()

        for(let i=0;i<labels.length;i++) {
            this.labelMap[labels[i]] =  i
        }
    }

    _initCode() {
        for(let line of this.code) {
            let pre = document.createElement("pre")
            pre.innerHTML = line
            this.codeElements.push(pre)
            this.container.appendChild(pre)
        }
    }

    _current = null
    get current() {
        return this._current
    }
    set current(label) {
        let index = this.labelMap[label]

        this._current?.removeAttribute('current')

        this._current = this.codeElements[index]
        this._current?.setAttribute('current', true)
    }

    finish() {
        this.wrapper.style.display = 'none'
        this.container.innerHTML = ''
    }
}