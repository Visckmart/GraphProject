export default class AlgorithmMenu {
    constructor() {
        this.menu = document.getElementById('algorithmMenu')

        this.menu.style.display = ''

        this.tabElements = Array.from(document.getElementById('algorithmMenuTabs').children)

        // Inicializando evento de click para mudar de aba
        this.tabElements.forEach(element => {
            element.onclick = () => {
                this.selectedTab = element
            }
        })
    }

    _selectedTab
    get selectedTab() {
        return this._selectedTab
    }
    set selectedTab(tab) {
        let value = tab.getAttribute('value')
        this._selectedTab = tab

        // Escondendo aba anterior
        this.tabElements.forEach(element => {
            element.removeAttribute('active')
            let id = element.getAttribute('value')
            let node = document.getElementById(id)
            node.style.display = 'none'
        })

        let node = document.getElementById(value)
        node.style.display = ''
        tab.setAttribute('active', 'true')
    }

    finish() {
        this.menu.style.display = 'none'
    }
}