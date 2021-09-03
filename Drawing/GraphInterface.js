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

import { TrayHandler } from "./ToolInteraction.js";
import { GraphView, isMobile } from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";
import GraphMenuHandler from "./GraphMenuHandler.js";
import {
    exportAsFile, exportAsText, exportAsURL, exportViewAsImage, importFromFile, importFromText, prepareCanvasSharing
} from "./InteractionShare.js";
// import { loadCategoriesFromStorage } from "./Interaction.js";

// let isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
export class GraphInterface {
    constructor(view, tray) {
        console.log("Inicializando interface");
        this.view = new GraphView(this, view[0], view[1], view[2], true);
        this.tray = new TrayHandler(tray, this);
        this.menu = new GraphMenuHandler(this.view);

        // Window Resizing
        window.onresize = this.view.recalculateLayout.bind(this.view)
        this.view.recalculateLayout()
        /* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
        document.body.onblur = function() {
            this.view.primaryTool = this.view.keyboardHandler.lastToolChoice;
        }.bind(this);

        if (!isMobile) {
            this.initialize()
        } else {
            this.mobileInitialization();
        }
    }

    // TODO: Verificar e extrair possíveis similaridades entre as inicializações
    initialize() {
        let exportFileButton = document.getElementById("exportFile");
        if (exportFileButton) {
            exportFileButton.onclick = () => exportAsFile(this.view.structure);
        } else {
            console.warn("Botão de exportar como arquivo não foi encontrado.");
        }

        let exportTextButton = document.getElementById("exportText");
        if (exportTextButton) {
            exportTextButton.onclick = () => exportAsText(this.view.structure);
        } else {
            console.warn("Botão de exportar como texto não foi encontrado.");
        }

        let exportLinkButton = document.getElementById("exportLink");
        if (exportLinkButton) {
            exportLinkButton.onclick = () => exportAsURL(this.view.structure);
        } else {
            console.warn("Botão de exportar como link não foi encontrado.");
        }

        let exportImageButton = document.getElementById("exportImage");
        if (exportImageButton) {
            exportImageButton.onclick = () => exportViewAsImage(this.view);
        } else {
            console.warn("Botão de exportar como imagem não foi encontrado.");
        }

        let tutorialOverlay = document.getElementById("tutorial-overlay");
        // console.log(window.localStorage.getItem("tutorial-quit"))
        if (window.localStorage.getItem("tutorial-quit") != "true") {
            tutorialOverlay.style.visibility = "visible";
        }
        let quitTutorialButton = document.getElementById("quit-tutorial");
        quitTutorialButton.onclick = () => {
            tutorialOverlay.style.display = "none";
            window.localStorage.setItem("tutorial-quit", true);
        }

        let undoButton = document.getElementById("undo-button");
        undoButton.onclick = () => {
            let step = this.view.history.goToStep(-1);
            if (step) {
                this.view.refreshGraph();
            }
        }
        let redoButton = document.getElementById("redo-button");
        redoButton.onclick = () => {
            let step = this.view.history.goToStep(1);
            if (step) {
                this.view.refreshGraph();
            }
        }


        window.addEventListener("load", this.deserializeURL.bind(this));
        window.onpopstate = () => {
            this.deserializeURL(this)
        }

        prepareCanvasSharing(this.view)

        // TODO: Organizar
        let fileInputElement = document.getElementById("inputFile");
        fileInputElement.onchange = importFromFile.bind(null, this.view)
        let importFileButton = document.getElementsByClassName("importFile");
        for (let x of importFileButton) {
            // console.log(x)
            x.onclick = () => fileInputElement.click();
        }
        let importTextButton = document.getElementsByClassName("importText");
        for (let x of importTextButton) {
            x.onclick = importFromText.bind(null, this.view)
        }
    }

    mobileInitialization() {
        let menuArea = document.getElementById("menuArea")
        if (menuArea) {
            menuArea.style.display = "none";
        } else {
            console.warn("Menu lateral não foi encontrado.");
        }

        let tray = document.getElementById("tray")
        if (tray) {
            tray.style.display = "none";
        } else {
            console.warn("Tray não foi encontrada.");
        }

        let fileInputElement = document.getElementById("inputFile");
        if (fileInputElement) {
            fileInputElement.onchange = (e) => {
                importFromFile(this.view, e, () => exportAsURL(this.view.structure))
            }
        } else {
            console.warn("Elemento de escolha de arquivos não foi encontrado.");
        }
        let importFileButtons = document.getElementsByClassName("importFile");
        for (let importFileButton of importFileButtons) {
            importFileButton.onclick = () => fileInputElement.click();
        }
        let importTextButtons = document.getElementsByClassName("importText");
        for (let importTextButton of importTextButtons) {
            importTextButton.onclick = () => {
                importFromText(this.view)
                exportAsURL(this.view.structure)
            }
        }

        let shareModal = document.getElementById("shareModal");
        if (shareModal) {
            shareModal.style.display = "flex";
        } else {
            console.warn("Tela de importação não foi encontrada.");
        }
        let closeModalButton = document.getElementsByClassName("importCancel")[0];
        if (closeModalButton) {
            closeModalButton.onclick = () => {
                shareModal.style.display = "none";
            }
        } else {
            console.warn("Botão de fechar a tela de importação não foi encontrado.");
        }

        window.addEventListener("load", this.deserializeURL.bind(this));
        window.onpopstate = () => {
            this.deserializeURL(this)
        }
        this.view.recalculateLayout();
    }

    deserializeURL() {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has("graph") && urlParams.get("graph") !== "") {
            console.log("Deserializing graph " + urlParams.get("graph"));
            this.view.loadSerializedGraph(urlParams.get("graph"));
            this.menu.refreshMenuFromGraph();
        } else {
            this.menu.loadCategoriesFromStorage();
        }
    }
    didUpdateTray(targetElement) {
        switch (targetElement.name) {
        case "tool":
            this.view.primaryTool = targetElement.value;
            break;
        case "feature":
            ToolRepository[targetElement.value].bind(this.view)();
            this.view.registerStep();
            targetElement.checked = false;
            break;
        }
    }

    didChangeTool(tool) {
        this.tray.refreshIcons(tool);
        this.view.mouseHandler.refreshCursorStyle();
    }


}