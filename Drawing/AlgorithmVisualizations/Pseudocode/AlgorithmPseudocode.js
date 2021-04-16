// Arquivos CSS
//import "./algorithm_pseudocode.css"

export default class AlgorithmPseudocode {
    constructor(code, labels) {
        this.code = code
        this.labels = labels
        this.labelMap = {}

        /* Capturando elementos do documento */
        this.wrapper = document.getElementById("pseudocode")
        this.container = document.getElementById("pseudoContainer")

        this.wrapper.style.display = ''
        this.tab = document.getElementById("pseudocodeTab")

        if(this.tab) {
            this.tab.style.display = ''
        }

        this.codeElements = []
        this._initCode()

        for(let i=0;i<labels.length;i++) {
            this.labelMap[labels[i]] =  i
        }


        // Adicionando evento de popup
        document.getElementById("pseudoPopup")?.addEventListener('click', this.popup.bind(this))
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
    _currentLabel = null
    get current() {
        return this._current
    }
    set current(label) {
        let index = this.labelMap[label]

        if(this._popup) {
            localStorage.setItem('pseudo__message-label', label)
        }

        this._current?.removeAttribute('current')

        this._current = this.codeElements[index]
        this._currentLabel = label
        this._current?.setAttribute('current', true)
        this._current?.scrollIntoView({behavior: "smooth"})
    }

    finish() {
        if(this._popup) {
            localStorage.setItem('pseudo__message-close', 'true')
            localStorage.removeItem('pseudo__message-close')
            localStorage.removeItem('pseudo__message-label')
            localStorage.removeItem('pseudo__code')
            localStorage.removeItem('pseudo__labels')
            this._popup?.close()
        }

        this.wrapper.style.display = 'none'
        document.getElementById("pseudocodeTab").style.display = 'none'
        this.container.innerHTML = ''
    }

    _popup = null
    popup() {
        // Preparando dados para inicialização do popup
        localStorage.setItem('pseudo__code', JSON.stringify(this.code))
        localStorage.setItem('pseudo__labels', JSON.stringify(this.labels))
        localStorage.setItem('pseudo__message-label', this._currentLabel)

        window.onPseudoClose = () => {
            this._popup = null
        }

        this._popup = window.open('./AlgorithmControls/Pseudocode/window.html',
            'window',
            `toolbar=no,scrollbars=yes,resizable=yes,top=200,left=200`)

    }

    /* Função chamada pelo popup para se conectar com a janela principal */
    static connect() {
        let code = JSON.parse(localStorage.getItem('pseudo__code'))
        let labels = JSON.parse(localStorage.getItem('pseudo__labels'))

        let manager =  new AlgorithmPseudocode(code, labels)

        manager.current = localStorage.getItem('pseudo__message-label')

        window.onstorage = (event) => {
            if(event.key === 'pseudo__message-label') {
                manager.current = event.newValue
            }
            else if(event.key === 'pseudo__message-close') {
                window.close()
            }
        }

        window.onunload = () => {
            window?.opener?.onPseudoClose()
        }
    }
}