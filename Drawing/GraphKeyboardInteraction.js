import { Tool } from "./General.js"

const graphKeyboardHandler = (graphView) => ({

    /* Variável para relembrar a ferramenta escolhida depois da tecla
       especial ser levantada. */
    lastToolChoice: Tool.MOVE,

    isMetaKey(keyboardEvent) {
        let metaPressed = event.metaKey;
        if (navigator.platform.includes("Mac") == false) {
            metaPressed = event.ctrlKey;
        }
        return metaPressed
    },

    isDeletionKey(keyboardEvent) {
        let pressed = keyboardEvent.code === "Backspace"
        if (navigator.platform.includes("Mac") == false) {
            pressed = keyboardEvent.code === "Delete"
        }
        return pressed
    },

    keyPressed(keyboardEvent) {
        let metaPressed = graphView.isMetaKey(keyboardEvent)
        console.log(keyboardEvent)
        if (keyboardEvent.key == "e") { // E
            graphView.structure.showGraph()
        }
        if (keyboardEvent.key == "a") { // A
            graphView.selectAllNodes()
            event.preventDefault()
        }
        // Tratamento da seleção da ferramenta Connect ao pressionar a tecla "meta".
        // No caso do Mac a tecla em questão é Command
        if (metaPressed) {
            if(graphView.lastToolChoice === null) {
                graphView.lastToolChoice = graphView.primaryTool;
            }
            graphView.primaryTool = Tool.CONNECT;
        }
    },

    keyReleased(keyboardEvent) {
        let metaPressed = graphView.isMetaKey(keyboardEvent)
        if (metaPressed == false && graphView.lastToolChoice == Tool.MOVE) {
            graphView.primaryTool = Tool.MOVE;
            graphView.lastToolChoice = null;
        }
        if (graphView.isDeletionKey(keyboardEvent)) {
            for (let node of graphView.multipleSelectedNodes) {
                graphView.structure.removeNode(node)
            }
            graphView.multipleSelectedNodes = []
        }
    }
})

export default graphKeyboardHandler