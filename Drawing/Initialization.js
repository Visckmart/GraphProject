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

    let fileInputElement = document.getElementById("inputFile");
    fileInputElement.onchange = importFromFile.bind(null, g)
    let importFileButton = document.getElementById("importFile");
    importFileButton.onclick = () => fileInputElement.click();
    let importTextButton = document.getElementById("importText");
    importTextButton.onclick = importFromText.bind(null, g)
} else {

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
    window.addEventListener("load", deserializeURL.bind(null, g));
    // g.recalculateLayout()
}
