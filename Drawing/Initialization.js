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

import { deserializeURL, exportAsURL, importFromFile, importFromText } from "./InteractionShare.js";
import { g, isMobile } from "./GraphView.js";

if (!isMobile) {
    // let exportFileButton = document.getElementById("exportFile");
    // if (exportFileButton) {
    //     exportFileButton.onclick = () => exportAsFile(g.structure);
    // } else {
    //     console.warn("Botão de exportar como arquivo não foi encontrado.");
    // }
    //
    // let exportTextButton = document.getElementById("exportText");
    // if (exportTextButton) {
    //     exportTextButton.onclick = () => exportAsText(g.structure);
    // } else {
    //     console.warn("Botão de exportar como texto não foi encontrado.");
    // }
    //
    // let exportLinkButton = document.getElementById("exportLink");
    // if (exportLinkButton) {
    //     exportLinkButton.onclick = () => exportAsURL(g.structure);
    // } else {
    //     console.warn("Botão de exportar como link não foi encontrado.");
    // }
    //
    // let exportImageButton = document.getElementById("exportImage");
    // if (exportImageButton) {
    //     exportImageButton.onclick = () => exportViewAsImage(g);
    // } else {
    //     console.warn("Botão de exportar como imagem não foi encontrado.");
    // }
    //
    // let tutorialOverlay = document.getElementById("tutorial-overlay");
    // // console.log(window.localStorage.getItem("tutorial-quit"))
    // if (window.localStorage.getItem("tutorial-quit") != "true") {
    //     tutorialOverlay.style.visibility = "visible";
    // }
    // let quitTutorialButton = document.getElementById("quit-tutorial");
    // quitTutorialButton.onclick = () => {
    //     tutorialOverlay.style.display = "none";
    //     window.localStorage.setItem("tutorial-quit", true);
    // }
    //
    // let undoButton = document.getElementById("undo-button");
    // undoButton.onclick = () => {
    //     let step = g.history.goToStep(-1);
    //     if (step) {
    //         g.structure = step;
    //         g.refreshGraph();
    //     }
    // }
    // let redoButton = document.getElementById("redo-button");
    // redoButton.onclick = () => {
    //     let step = g.history.goToStep(1);
    //     if (step) {
    //         g.structure = step;
    //         g.refreshGraph();
    //     }
    // }
    //
    //
    // window.addEventListener("load", deserializeURL.bind(null, g));
    // window.onpopstate = (event) => {
    //     if (event.state) { deserializeURL(g) }
    // }
    //
    // prepareCanvasSharing(g)
    //
    // // TODO: Organizar
    // let fileInputElement = document.getElementById("inputFile");
    // fileInputElement.onchange = importFromFile.bind(null, g)
    // let importFileButton = document.getElementsByClassName("importFile");
    // for (let x of importFileButton) {
    //     // console.log(x)
    //     x.onclick = () => fileInputElement.click();
    // }
    // let importTextButton = document.getElementsByClassName("importText");
    // for (let x of importTextButton) {
    //     // console.log(x)
    //     x.onclick = importFromText.bind(null, g)
    // }
} else {
    // TODO: Organizar
    let menuArea = document.getElementById("menuArea")
    menuArea.style.display = "none";
    let canvasArea = document.getElementById("canvasArea")
    // canvasArea.style.width = "100%"
    // canvasArea.style.maxWidth = "100%"
    let tray = document.getElementById("tray")
    tray.style.display = "none";
    let ic = document.getElementById("interfaceContainer")
    ic.style.height = "80vh";
    ic.style.maxHeight = "80vh";
    let fileInputElement = document.getElementById("inputFile");
    fileInputElement.onchange = (e) => {
        importFromFile(g, e, () => exportAsURL(g.structure))
    }
    let importFileButton = document.getElementsByClassName("importFile");
    for (let x of importFileButton) {
        // console.log(x)
        x.onclick = () => fileInputElement.click();
    }
    let importTextButton = document.getElementsByClassName("importText");
    for (let x of importTextButton) {
        // console.log(x)
        x.onclick = () => {
            importFromText(g)
            exportAsURL(g.structure)
        }
    }
    let shareModal = document.getElementById("shareModal");
    shareModal.style.display = "flex";
    let importCancelButton = document.getElementsByClassName("importCancel")[0];
    importCancelButton.onclick = () => {
        let shareModal = document.getElementById("shareModal");
        shareModal.style.display = "none";
    }
    window.addEventListener("load", deserializeURL.bind(null, g));
    g.recalculateLayout()
}
