import { Tool } from "./General.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";

class GraphKeyboardHandler {

    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;

        // Começa habilitado
        this._enabled = true
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
        // Eventos de teclado desabilitados
        if(!this._enabled) { return }

        // Ignorando eventos de teclado enquanto a seleção múltipla está ativa
        if(this.selection.shouldDrawSelection) {
            return;
        }

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
        // console.log(keyboardEvent.key)
        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = true;
        }
        if (metaPressed) {
            if(this.graphView.lastToolChoice == null) {
                this.graphView.lastToolChoice = this.graphView.primaryTool;
            }
            this.graphView.primaryTool = Tool.CONNECT;
        }
        if (keyboardEvent.key == 1) {
            this.graphView.primaryTool = Tool.MOVE;
        } else if (keyboardEvent.key == 2) {
            this.graphView.primaryTool = Tool.CONNECT;
        }
    }

    keyReleased(keyboardEvent) {
        // Eventos de teclado desabilitados
        if(!this._enabled)
        {
            return
        }
        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = false;
        }

        // Ignorando eventos de teclado enquanto a seleção múltipla está ativa
        if(this.selection.drawingSelection)
        {
            return
        }

        let metaPressed = this.isMetaKey(keyboardEvent)
        if (metaPressed == false && this.graphView.lastToolChoice == Tool.MOVE) {
            this.graphView.primaryTool = Tool.MOVE;
            this.graphView.lastToolChoice = null;
        }
        if (keyboardEvent.key == "d") {
            let algorithmController = new AlgorithmController(this.graphView)
            algorithmController.setup(DijkstraShortestPath)
        }
        if (keyboardEvent.key == "s") {
            console.log(this.graphView.structure.serialize())
        }
        if (document.activeElement.tagName == "BODY") {
            if (this.isDeletionKey(keyboardEvent)) {
                for (let node of this.selection.selected.nodes) {
                    this.graphView.structure.removeNode(node)
                }
                for (let edge of this.selection.selected.edges) {
                    this.graphView.structure.removeEdge(edge)
                }
                this.selection.clear()
            }
        }
    }

    enable() {
        this._enabled = true
    }

    disable() {
        this._enabled = false
    }
}

export default GraphKeyboardHandler