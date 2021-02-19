import { Tool } from "./General.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
import PrimMST from "../Algorithm/PrimMST.js";
import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";

class GraphKeyboardHandler {

    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;

        /* Variável para relembrar a ferramenta escolhida depois da tecla
           especial ser levantada. */
        this.lastToolChoice = this.graphView.primaryTool;

        // Começa habilitado
        this._enabled = true
    }

    isMetaKey(keyboardEvent) {
        let metaPressed = keyboardEvent.metaKey;
        if (navigator.platform.includes("Mac") == false) {
            metaPressed = keyboardEvent.ctrlKey;
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


    // Key Pressed

    keyPressed(keyboardEvent) {
        // Eventos de teclado desabilitados
        if(!this._enabled) { return }

        // Ignorando eventos de teclado enquanto a seleção múltipla está ativa
        if(this.selection.shouldDrawSelection) { return; }


        let metaPressed = this.isMetaKey(keyboardEvent)

        if (document.activeElement.tagName == "BODY") {
            if (keyboardEvent.key == "e") { // E
                this.graphView.structure.showGraph()
            }
            // console.log(keyboardEvent.key)
            if (keyboardEvent.key == "a") { // A
                this.graphView.selectAllNodes()
                keyboardEvent.preventDefault()
            }
        }

        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = true;
        }
        if (metaPressed) {
            if (this.lastToolChoice == null) {
                this.lastToolChoice = this.graphView.primaryTool;
            }
            this.graphView.primaryTool = Tool.CONNECT;
        }

        switch (keyboardEvent.key) {
        case "z": {
            if (keyboardEvent.shiftKey == false) {
                let step = this.graphView.history.goToStep(-1);
                this.graphView.structure = step;
                keyboardEvent.preventDefault()
                break
            }
        }
        case "Z": {
            let step = this.graphView.history.goToStep(1);
            this.graphView.structure = step;
            keyboardEvent.preventDefault()
            break
        }
        }

        if (keyboardEvent.key == 1) {
            this.graphView.primaryTool = Tool.MOVE;
        } else if (keyboardEvent.key == 2) {
            this.graphView.primaryTool = Tool.CONNECT;
        }
    }


    // Key Released

    keyReleased(keyboardEvent) {
        // Eventos de teclado desabilitados
        if(!this._enabled) { return; }

        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = false;
        }

        // Ignorando eventos de teclado enquanto a seleção múltipla está ativa
        if(this.selection.shouldDrawSelection) { return; }

        let metaPressed = this.isMetaKey(keyboardEvent)
        if (metaPressed == false && this.lastToolChoice == Tool.MOVE) {
            this.graphView.primaryTool = Tool.MOVE;
            this.lastToolChoice = null;
        }

        switch (keyboardEvent.key) {
        case "d":
            let algorithmController = new AlgorithmController(this.graphView);
            let algorithmSelector = document.getElementById("algorithm")
            let chosenAlgorithm = null;
            switch (algorithmSelector.value) {
            case 'Dijkstra':
                chosenAlgorithm = DijkstraShortestPath
                break
            case 'PrimMST':
                chosenAlgorithm = PrimMST
                break
            case 'DFSCycleDetection':
                chosenAlgorithm = DFSCycleDetection
                break
            default:
                break;
            }
            algorithmController.setup(chosenAlgorithm);
            break;
        case "s":
            console.log(this.graphView.structure.serialize());
            break;
        case "Escape":
            this.graphView.selectionHandler.clear();
            break;
        case "m":
            this.graphView.snapNodesToGrid();
            break;
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