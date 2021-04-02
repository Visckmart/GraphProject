import { prepareCanvasSharing } from "./InteractionShare.js";

import {exportAsFile, exportAsText, exportAsURL, exportViewAsImage,deserializeURL, importFromFile, importFromText} from "./InteractionShare.js"
import {g} from "./GraphView.js";

console.log("Inicializando...");

let exportFileButton = document.getElementById("exportFile");
exportFileButton.onclick = () => exportAsFile(g.structure);

let exportTextButton = document.getElementById("exportText");
exportTextButton.onclick = () => exportAsText(g.structure);

let exportLinkButton = document.getElementById("exportLink");
exportLinkButton.onclick = () => exportAsURL(g.structure);

let exportImageButton = document.getElementById("exportImage");
exportImageButton.onclick = () => exportViewAsImage(g);

window.addEventListener("load", deserializeURL);
window.onpopstate = (event) => {
    if (event.state) { deserializeURL() }
}

prepareCanvasSharing(g)

let fileInputElement = document.getElementById("inputFile");
fileInputElement.onchange = importFromFile.bind(null, g)
let importFileButton = document.getElementById("importFile");
importFileButton.onclick = () => fileInputElement.click();
let importTextButton = document.getElementById("importText");
importTextButton.onclick = importFromText.bind(null, g)

