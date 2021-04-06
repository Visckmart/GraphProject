import { prepareCanvasSharing } from "./InteractionShare.js";
import {exportAsFile, exportAsText, exportAsURL, exportViewAsImage,deserializeURL, importFromFile, importFromText} from "./InteractionShare.js"
import {g} from "./GraphView.js";

let isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);

if (!isMobile) {
    console.log("Inicializando...");
    let exportFileButton = document.getElementById("exportFile");
    exportFileButton.onclick = () => exportAsFile(g.structure);

    let exportTextButton = document.getElementById("exportText");
    exportTextButton.onclick = () => exportAsText(g.structure);

    let exportLinkButton = document.getElementById("exportLink");
    exportLinkButton.onclick = () => exportAsURL(g.structure);

    let exportImageButton = document.getElementById("exportImage");
    exportImageButton.onclick = () => exportViewAsImage(g);

    window.addEventListener("load", deserializeURL.bind(null, g));
    window.onpopstate = (event) => {
        if (event.state) { deserializeURL(g) }
    }

    prepareCanvasSharing(g)

    // TODO: Organizar
    let fileInputElement = document.getElementById("inputFile");
    fileInputElement.onchange = importFromFile.bind(null, g)
    let importFileButton = document.getElementsByClassName("importFile");
    for (let x of importFileButton) {
        console.log(x)
        x.onclick = () => fileInputElement.click();
    }
    let importTextButton = document.getElementsByClassName("importText");
    for (let x of importTextButton) {
        console.log(x)
        x.onclick = importFromText.bind(null, g)
    }
} else {
    // TODO: Organizar
    let menuArea = document.getElementById("menuArea")
    menuArea.style.display = "none";
    let canvasArea = document.getElementById("canvasArea")
    canvasArea.style.width = "100%"
    canvasArea.style.maxWidth = "100%"
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
        console.log(x)
        x.onclick = () => fileInputElement.click();
    }
    let importTextButton = document.getElementsByClassName("importText");
    for (let x of importTextButton) {
        console.log(x)
        x.onclick = () => {
            importFromText(g)
            exportAsURL(g.structure)
        }
    }
    let importCancelButton = document.getElementsByClassName("importCancel")[0];
    importCancelButton.onclick = () => {
        let shareModal = document.getElementById("shareModal")
        shareModal.style.display = "none";
    }
    window.addEventListener("load", deserializeURL.bind(null, g));
    // g.recalculateLayout()
}
