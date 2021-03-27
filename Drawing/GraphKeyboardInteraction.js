import { Tool } from "./General.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import { getAlgorithmFromName } from "./Interaction.js";

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

    get deletionKey() {
        let key =  "Backspace";
        if (navigator.platform.includes("Mac") == false) {
            key = "Delete";
        }
        return key;
    }

    // Key Pressed

    shouldHandleKeyboardEvent() {
        // Eventos de teclado desabilitados
        if (!this._enabled) { return false; }

        // Ignorando eventos de teclado enquanto a seleção múltipla está ativa
        if (this.selection.shouldDrawSelection) { return false; }

        return true;
    }

    keyPressed = (keyboardEvent) => {
        if (this.shouldHandleKeyboardEvent() == false) { return; }

        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = true;
        }

        if (document.activeElement.tagName != "BODY") { return; }


        let metaPressed = this.isMetaKey(keyboardEvent)
        if (metaPressed) {
            if (this.lastToolChoice == null) {
                this.lastToolChoice = this.graphView.primaryTool;
            }
            this.graphView.primaryTool = Tool.CONNECT;
        }

        switch (keyboardEvent.key) {
        case "1":
            this.graphView.primaryTool = Tool.MOVE;
            break;
        case "2":
            this.graphView.primaryTool = Tool.CONNECT;
            break;
        }
    }


    // Key Released

    keyReleased = (keyboardEvent) => {
        if (this.shouldHandleKeyboardEvent() == false) { return; }

        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = false;
        }

        if (document.activeElement.tagName != "BODY") { return; }


        let metaPressed = this.isMetaKey(keyboardEvent);
        if (metaPressed == false && this.lastToolChoice == Tool.MOVE) {
            this.graphView.primaryTool = Tool.MOVE;
            this.lastToolChoice = null;
        }

        switch (keyboardEvent.key) {
        case "a":
            this.graphView.selectAllNodes();
            keyboardEvent.preventDefault();
            break;

        case "d":
            let algorithmController = new AlgorithmController(this.graphView);
            let algorithmSelector = document.getElementById("algorithm")
            let chosenAlgorithm = getAlgorithmFromName(algorithmSelector.value);
            if (chosenAlgorithm) {
                algorithmController.setup(chosenAlgorithm);
            }
            break;

        case "e":
            this.graphView.structure.showGraph();
            break;
        case "m":
            this.graphView.snapNodesToGrid();
            break;

        case "s":
            console.log(this.graphView.structure.serialize());
            break;

        case "z":
            if (keyboardEvent.shiftKey == false) {
                let step = this.graphView.history.goToStep(-1);
                if (step) {
                    this.graphView.structure = step;
                    this.graphView.refreshGraph();
                    keyboardEvent.preventDefault();
                }
            }
            break;

        case "Z":
            let step = this.graphView.history.goToStep(1);
            if (step) {
                this.graphView.structure = step;
                this.graphView.refreshGraph();
                keyboardEvent.preventDefault();
            }
            break;


        case "Escape":
            this.graphView.selectionHandler.clear();
            break;

        case this.deletionKey:
            for (let node of this.selection.selected.nodes) {
                this.graphView.structure.removeNode(node);
            }
            for (let edge of this.selection.selected.edges) {
                this.graphView.structure.removeEdge(edge);
            }
            this.selection.clear();
            this.graphView.refreshGraph();
            break;
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