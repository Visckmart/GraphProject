import { canvas, slowOverlayCanvas } from "./General.js";
import {g} from "./GraphView.js";
import {getFormattedTime} from "../Structure/Utilities.js";

//region Exportação

// Exportar Arquivo
let exportFileButton = document.getElementById("exportFile");
function saveAsFile(name) {
    let content = g.structure.serialize();
    let encodedContent = 'data:text/plain;charset=utf-8,'
                         + encodeURIComponent(content);

    let element = document.createElement('a');
    element.download = name;
    element.href = encodedContent;

    element.click();
}
exportFileButton.onclick = function () {
    let name = `Grafo ${getFormattedTime()}.gp`;
    saveAsFile(name);
}


// Exportar Texto
let exportTextButton = document.getElementById("exportText");
exportTextButton.onclick = function () {
    alert("Texto para Compartilhamento\n\n" + g.structure.serialize());
}


// Exportar Link
let exportLinkButton = document.getElementById("exportLink");
exportLinkButton.onclick = function (mouseEvent) {
    let serializedGraph = g.structure.serialize();
    if (mouseEvent.button === 0) {
        let shareLink = window.location.protocol + "//"
            + window.location.host + window.location.pathname
            + "?graph=" + serializedGraph;
        history.pushState(null, null, shareLink);
    } else {
        console.log(serializedGraph);
    }
}


// Exportar Imagem
let exportImageButton = document.getElementById("exportImage");
// TODO: Organizar um pouco mais
exportImageButton.onclick = function () {
    g.processingScreenshot = true;

    let textImg = new Image();
    textImg.src = slowOverlayCanvas.toDataURL('image/png');
    g.redrawGraph(true);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(textImg, 0, 0);
    let image = canvas.toDataURL();

    g.processingScreenshot = false;

    let temporaryLink = document.createElement('a');
    temporaryLink.download = `Grafo ${getFormattedTime()}.png`;
    temporaryLink.href = image;

    temporaryLink.click();
}
//endregion


//region Importação

// Importar por Link
function deserializeURL() {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has("graph") && urlParams.get("graph") !== "") {
        console.log("Deserializing graph " + urlParams.get("graph"));
        g.loadSerializedGraph(urlParams.get("graph"));
    }
}

window.addEventListener("load", deserializeURL);
window.onpopstate = (event) => {
    if (event.state) {
        deserializeURL()

    }
}


//region Importar por Gesto
canvas.ondragenter = function (event) {
    event.preventDefault();
    g.overlay = true;
};

canvas.ondragover = function (event) {
    event.preventDefault();
};

canvas.ondragleave = function (event) {
    event.preventDefault();
    g.overlay = false;
};

canvas.ondrop = function (event) {
    event.preventDefault();
    let item = event.dataTransfer.items[0];
    console.log("Dropped", item);

    // Se for arquivo
    if (item.kind === "file") {
        let droppedFile = item.getAsFile();
        let reader = new FileReader();
        reader.onload = function (evt) {
            g.loadSerializedGraph(evt.target.result);
        }
        reader.readAsText(droppedFile, "UTF-8");

        // Senão
    } else {
        item.getAsString(str => g.loadSerializedGraph(str));
    }
    g.overlay = false;
};
//endregion


// Importar Arquivo
let fileInputElement = document.getElementById("inputFile");
fileInputElement.onchange = function (event) {
    let file = event.target.files[0];
    if (!file) {
        return;
    }

    let reader = new FileReader();
    reader.onload = function (evt) {
        g.loadSerializedGraph(evt.target.result);
    }
    reader.readAsText(file, "UTF-8");
}
let importFileButton = document.getElementById("importFile");
importFileButton.onclick = () => fileInputElement.click();


// Importação de Texto
let importTextButton = document.getElementById("importText");
importTextButton.onclick = function () {
    let serializedInput = prompt("Grafo em Texto");
    g.loadSerializedGraph(serializedInput);
}
//endregion