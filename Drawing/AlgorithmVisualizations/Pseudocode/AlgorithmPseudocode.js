export default class AlgorithmPseudocode {
    constructor(code) {
        this.code = code

        /* Capturando elementos do documento */
        this.wrapper = document.getElementById("pseudocode")
        this.container = document.getElementById("pseudoContainer")
        this.container.innerHTML = code

        this.wrapper.style.display = ''
        this.tab = document.getElementById("pseudocodeTab")

        if(this.tab) {
            this.tab.style.display = ''
        }

        // Adicionando evento de popup
        document.getElementById("pseudoPopup")?.addEventListener('click', this.popup.bind(this))
    }

    _currentLabel = null
    get current() {
        return document.querySelector('*[current=true]')
    }
    set current(label) {
        this._currentLabel = label
        if(this._popup) {
            localStorage.setItem('pseudo__message-label', label)
        }
        this.current?.removeAttribute('current')

        let highlighted =  document.querySelector(`#pseudoContainer *[label=${label}]`)
        highlighted?.setAttribute('current', 'true')
        highlighted?.scrollIntoView({behavior: "smooth"})
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
        localStorage.setItem('pseudo__message-label', this._currentLabel)

        window.onPseudoClose = () => {
            this._popup = null
        }

        this._popup = window.open('../Drawing/AlgorithmVisualizations/Pseudocode/window.html',
            'window',
            `toolbar=no,scrollbars=yes,resizable=yes,top=200,left=200`)

    }

    /* Função chamada pelo popup para se conectar com a janela principal */
    static connect() {
        let code = JSON.parse(localStorage.getItem('pseudo__code'))
        let manager =  new AlgorithmPseudocode(code)

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