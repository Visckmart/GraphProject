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

import { Tool } from "./General.js"
import AlgorithmController from "../Algorithm/Control/AlgorithmController.js";
// import { getAlgorithmFromName } from "./Interaction.js";
import { getFormattedTime } from "../Utilities/Utilities.js";
import { getAlgorithmModuleFromName } from "./GraphMenuHandler.js";

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




        let metaPressed = this.isMetaKey(keyboardEvent)
        if (metaPressed) {
            let originalToolChoice = this.lastToolChoice;
            if (this.lastToolChoice == Tool.MOVE) {
                this.graphView.primaryTool = Tool.CONNECT;
            } else if (this.lastToolChoice == Tool.CONNECT) {
                this.graphView.primaryTool = Tool.MOVE;
            }
            this.lastToolChoice = originalToolChoice;
        }

        if (document.activeElement.tagName != "BODY") { return; }

        switch (keyboardEvent.key) {
        case "1":
            this.graphView.primaryTool = Tool.MOVE;
            break;
        case "2":
            this.graphView.primaryTool = Tool.CONNECT;
            break;

        case "s": // TODO: Organizar atalho de salvamento
            if (metaPressed) {
                keyboardEvent.preventDefault();
                let filename = prompt("Nome do arquivo:",
                                      `Grafo ${getFormattedTime()}`)
                if (filename == null) break;
                let content = this.graphView.structure.serialize();
                let encodedContent = 'data:text/plain;charset=utf-8,'
                                     + encodeURIComponent(content);

                let element = document.createElement('a');
                element.download = filename+".gp";
                element.href = encodedContent;

                element.click();
            } else {
                console.log(this.graphView.structure.serialize());
            }
            break;
        }
    }


    // Key Released

    keyReleased = (keyboardEvent) => {
        if (this.shouldHandleKeyboardEvent() == false) { return; }

        if (keyboardEvent.key == "Shift") {
            this.selection.additionOnlyMode = false;
        }


        let metaPressed = this.isMetaKey(keyboardEvent);
        if (metaPressed == false) {
            let originalToolChoice = this.lastToolChoice;
            this.graphView.primaryTool = this.lastToolChoice;
            this.lastToolChoice = originalToolChoice;
        }

        if (document.activeElement.tagName != "BODY") { return; }

        switch (keyboardEvent.key) {
        case "a":
            this.graphView.selectAllNodes();
            keyboardEvent.preventDefault();
            break;

        case "d":
            let algorithmController = new AlgorithmController(this.graphView);
            let algorithmSelector = document.getElementById("algorithm")
            getAlgorithmModuleFromName(algorithmSelector.value)
                .then(algorithm => {
                    if (!algorithm) return;
                    algorithmController.setup(algorithm);
                });
            break;

        case "e":
            this.graphView.structure.showGraph();
            break;
        case "m":
            this.graphView.snapNodesToGrid();
            break;

        case "z":
            if (keyboardEvent.shiftKey == false) {
                let step = this.graphView.history.goToStep(-1);
                if (step) {
                    keyboardEvent.preventDefault();
                }
            }
            break;

        case "Z":
            let step = this.graphView.history.goToStep(1);
            if (step) {
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