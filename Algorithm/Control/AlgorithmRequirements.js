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

export const RequirementType = {
    SELECT_NODE: "select_node",
    CREATE_NODE: "create_node",
    CREATE_EDGE: "create_edge"
}


export class Requirement {
    constructor(inputHandler, type, message, callback, optional = false) {
        // Tipo de requisito
        this.type = type
        // Mensagem informativa sobre o requisito
        this.message = message

        this.inputHandler = inputHandler

        this.optional = optional
        this.resolve = () => {
            return this._handleRequirement().then(callback)
        }
    }

    // Função de handle que retorna uma Promise que resolve quando o evento é concluído
    async _handleRequirement() {
        return new Promise((resolve, reject) => {
            switch (this.type) {
                // Requisito de seleção de node
                case RequirementType.SELECT_NODE: {
                    this.inputHandler.changeCursorStyle("pointer")
                    let handler = (event) => {
                        let mousePos = this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        let clickedNodes =
                            this.inputHandler.graphView.getNodesAt(mousePos)
                        if (clickedNodes.length > 0) {
                            this.inputHandler.changeCursorStyle(null)

                            // Remove o evento para evitar repetição
                            this.inputHandler.canvas.removeEventListener("mouseup", handler)

                            // Finaliza requisição
                            resolve(clickedNodes[0])
                        }
                    }
                    this.inputHandler.canvas.addEventListener("mouseup", handler)

                    // Definindo função de skip para requisitos opcionais
                    this.skipRequirement = () => {
                        this.inputHandler.canvas.removeEventListener("mouseup", handler)
                        resolve()
                    }

                    break
                }
                // Requisito de criação de node
                case RequirementType.CREATE_NODE: {
                    this.inputHandler.changeCursorStyle("pointer")
                    let handler = (event) => {
                        let mousePos = this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        let newNode = this.inputHandler.graphView.insertNewNodeAt(mousePos)
                        if(newNode)
                        {
                            this.inputHandler.changeCursorStyle(null)

                            // Remove o evento para evitar repetição
                            this.inputHandler.canvas.removeEventListener("mouseup", handler)

                            // Finaliza requisição
                            resolve(newNode)
                        }
                    }
                    this.inputHandler.canvas.addEventListener("mouseup", handler)

                    // Definindo função de skip para requisitos opcionais
                    this.skipRequirement = () => {
                        this.inputHandler.canvas.removeEventListener("mouseup", handler)
                        resolve()
                    }
                    break
                }
                // Requisito de criação de aresta
                case RequirementType.CREATE_EDGE:
                    this.inputHandler.changeCursorStyle("pointer")
                    // Primeira node da aresta
                    let firstNode
                    // Segunda node da aresta
                    let secondNode

                    // Handler de mousedown usado para capturar a primeira node da aresta
                    let mouseDownHandler = (event) => {
                        let mousePos = this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        let nodesAtClick = this.inputHandler.graphView.getNodesAt(mousePos)
                        if(nodesAtClick.length > 0)
                        {
                            firstNode = nodesAtClick[0]

                            // TODO: Não gosto dessas linhas
                            // Desenhando aresta temporária
                            this.inputHandler.graphView.interactionHandler.mouse.clickPosition = mousePos
                            this.inputHandler.graphView.interactionHandler.mouse.shouldDrawTemporaryEdge = true

                            // Remove o evento para evitar repetição
                            this.inputHandler.canvas.removeEventListener("mousedown", mouseDownHandler)
                            this.inputHandler.canvas.addEventListener("mouseup", mouseUpHandler)
                            this.inputHandler.canvas.addEventListener("mousemove", mouseMoveHandler)
                        }
                    }
                    this.inputHandler.canvas.addEventListener("mousedown", mouseDownHandler)

                    // Handler de movimentação do mouse para redesenhar o grafo, atualizando a aresta temporária
                    let mouseMoveHandler = (event) => {
                        this.inputHandler.graphView.interactionHandler.mouse.currentMousePos =
                            this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        this.inputHandler.graphView.redrawGraph()
                    }

                    // Handler de mouseup para seleção do segundo node da aresta
                    let mouseUpHandler = (event) => {
                        this.inputHandler.graphView.interactionHandler.mouse.shouldDrawTemporaryEdge = false
                        this.inputHandler.canvas.removeEventListener("mouseup", mouseUpHandler)
                        this.inputHandler.canvas.removeEventListener("mousemove", mouseMoveHandler)

                        let mousePos = this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        let nodesAtClick = this.inputHandler.graphView.getNodesAt(mousePos)
                        // Verificando se a criação da aresta é válida
                        if(nodesAtClick.length > 0
                            && nodesAtClick[0] !== firstNode
                            && !this.inputHandler.graphView.structure.checkEdgeBetween(nodesAtClick[0], firstNode))
                        {
                            secondNode = nodesAtClick[0]
                            this.inputHandler.graphView.insertEdgeBetween(firstNode, secondNode)
                            this.inputHandler.graphView.redrawGraph()

                            this.inputHandler.changeCursorStyle(null)

                            // Finalizando requisição
                            resolve([firstNode, secondNode])
                        } else {
                            // Criação de aresta falhou, tentar novamente
                            firstNode = null
                            secondNode = null
                            this.inputHandler.changeCursorStyle("pointer")
                            this.inputHandler.canvas.addEventListener("mousedown", mouseDownHandler)
                        }
                    }

                    // Definindo função de skip para requisitos opcionais
                    this.skipRequirement = () => {
                        this.inputHandler.canvas.removeEventListener("mousedown", mouseDownHandler)
                        this.inputHandler.canvas.removeEventListener("mouseup", mouseUpHandler)
                        this.inputHandler.canvas.removeEventListener("mousemove", mouseMoveHandler)
                        resolve()
                    }
                    break
                default:
                    console.warn("REQUISITO NÃO SUPORTADO")
            }
        })

    }
}