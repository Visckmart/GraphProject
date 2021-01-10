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

    keyPressed(keyboardEvent) {
        let metaPressed = graphView.isMetaKey(keyboardEvent)
        if (keyboardEvent.keyCode == 69) { // E
            graphView.structure.showGraph()
        }
        if (keyboardEvent.keyCode == 65) { // A
            graphView.selectAllNodes()
            event.preventDefault()
        }
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
        if (keyboardEvent.code === "Delete") {
            for (let node of multipleSelectedNodes) {
                graphView.structure.removeNode(node)
            }
            multipleSelectedNodes = []
        }
    }
})

export default graphKeyboardHandler