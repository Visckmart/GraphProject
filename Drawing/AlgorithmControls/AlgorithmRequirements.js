export const RequirementType = {
    SELECT_NODE: "select_node"
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
                case RequirementType.SELECT_NODE:
                    this.inputHandler.changeCursorStyle("pointer")
                    let handler = (event) => {
                        let mousePos = this.inputHandler.getMousePos(this.inputHandler.canvas, event)
                        let clickedNodes =
                            this.inputHandler.graphView.getNodeIndexAt(mousePos)
                        if(clickedNodes.length > 0) {
                            this.inputHandler.changeCursorStyle(null)

                            // Remove o evento para evitar repetição
                            this.inputHandler.canvas.removeEventListener("mouseup", handler)
                            // Chama o callback com o nó resolvido
                            this.callback(clickedNodes[0])
                            // Finaliza a Promise
                            resolve(clickedNodes[0])
                        }
                    }
                    this.inputHandler.canvas.addEventListener("mouseup",
                        (event) => handler(event))
                    break
            }
        })

    }
}