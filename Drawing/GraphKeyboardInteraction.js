import { Tool } from "./General.js"

class GraphKeyboardHandler {

    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
    }

    /* Variável para relembrar a ferramenta escolhida depois da tecla
       especial ser levantada. */
    lastToolChoice = Tool.MOVE;

    isMetaKey(keyboardEvent) {
        let metaPressed = event.metaKey;
        if (navigator.platform.includes("Mac") == false) {
            metaPressed = event.ctrlKey;
        }
        return metaPressed;
    }

    isDeletionKey(keyboardEvent) {
        let pressed = keyboardEvent.key === "Backspace";
        if (navigator.platform.includes("Mac") == false) {
            pressed = keyboardEvent.key === "Delete";
        }
        return pressed;
    }

    keyPressed(keyboardEvent) {
        let metaPressed = this.isMetaKey(keyboardEvent)
        // console.log(keyboardEvent)
        if (document.activeElement.tagName == "BODY") {
            if (keyboardEvent.key == "e") { // E
                this.graphView.structure.showGraph()
            }
            // console.log(keyboardEvent.key)
            if (keyboardEvent.key == "a") { // A
                console.log(document.activeElement.tagName)
                this.graphView.selectAllNodes()
                keyboardEvent.preventDefault()
            }
        }
        // Tratamento da seleção da ferramenta Connect ao pressionar a tecla "meta".
        // No caso do Mac a tecla em questão é Command
        if (metaPressed) {
            if(this.graphView.lastToolChoice == null) {
                this.graphView.lastToolChoice = this.graphView.primaryTool;
            }
            this.graphView.primaryTool = Tool.CONNECT;
        }
    }

    keyReleased(keyboardEvent) {
        let metaPressed = this.isMetaKey(keyboardEvent)
        if (metaPressed == false && this.graphView.lastToolChoice == Tool.MOVE) {
            this.graphView.primaryTool = Tool.MOVE;
            this.graphView.lastToolChoice = null;
        }
        if (document.activeElement.tagName == "BODY") {
            if (this.isDeletionKey(keyboardEvent)) {
                for (let node of this.selection.selectedNodes) {
                    this.graphView.structure.removeNode(node)
                }
                this.selection.clear()
            }
        }
    }
}

export default GraphKeyboardHandler