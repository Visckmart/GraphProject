/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export default class AlgorithmMenu {
    constructor() {
        this.menu = document.getElementById('algorithmMenu')

        this.menu.style.display = ''

        this.tabElements = Array.from(document.getElementsByClassName("tab"))

        // Inicializando evento de click para mudar de aba
        // Reverte o array para selecionar a primeira aba visível, não a última
        this.tabElements.reverse().forEach(element => {
            element.onclick = () => {
                this.selectedTab = element
            }
            if(element.style.display !== 'none') {
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