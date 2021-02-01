export const RequirementType = {
    SELECT_NODE: "select_node",
    CREATE_NODE: "create_node",
    CREATE_EDGE: "create_edge"
}


export class Requirement {
    constructor(inputHandler, type, message, callback = () => {}) {
        // Tipo de requisito
        this.type = type
        // Mensagem informativa sobre o requisito
        this.message = message
        // Função de callback para quando o requisito é resolvido
        this.callback = callback

        this.inputHandler = inputHandler
    }

    // Função de handle que retorna uma Promise que resolve quando o evento é concluído
    async handle() {
        return new Promise((resolve, reject) => {
            switch (this.type) {
                // Requisito de seleção de node
                case RequirementType.SELECT_NODE: {
                    this.inputHandler.changeCursorStyle("pointer")
                    let handler = (event) => {
                        let mousePos = this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        let clickedNodes =
                            this.inputHandler.graphView.getNodeIndexAt(mousePos)
                        if (clickedNodes.length > 0) {
                            this.inputHandler.changeCursorStyle(null)

                            // Remove o evento para evitar repetição
                            this.inputHandler.canvas.removeEventListener("mouseup", handler)

                            // Finaliza requisição
                            this.callback(clickedNodes[0])
                            resolve(clickedNodes[0])
                        }
                    }
                    this.inputHandler.canvas.addEventListener("mouseup", handler)
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
                            this.callback(newNode)
                            resolve(newNode)
                        }
                    }
                    this.inputHandler.canvas.addEventListener("mouseup", handler)
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
                        let nodesAtClick = this.inputHandler.graphView.getNodeIndexAt(mousePos)
                        if(nodesAtClick.length > 0)
                        {
                            firstNode = nodesAtClick[0]
                            this.inputHandler.changeCursorStyle("grabbing")

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
                        let nodesAtClick = this.inputHandler.graphView.getNodeIndexAt(mousePos)
                        if(nodesAtClick.length > 0
                            && nodesAtClick[0] !== firstNode
                            && !this.inputHandler.graphView.structure.checkEdgeBetween(nodesAtClick[0], firstNode))
                        {
                            secondNode = nodesAtClick[0]
                            this.inputHandler.graphView.insertEdgeBetween(firstNode, secondNode)
                            this.inputHandler.graphView.redrawGraph()

                            this.inputHandler.changeCursorStyle(null)
                            this.callback([firstNode, secondNode])
                            resolve([firstNode, secondNode])
                        } else {
                            firstNode = null
                            secondNode = null
                            this.inputHandler.changeCursorStyle("pointer")
                            this.inputHandler.canvas.addEventListener("mousedown", mouseDownHandler)
                        }
                    }
                    break
                default:
                    console.warn("REQUISITO NÃO SUPORTADO")
            }
        })

    }
}