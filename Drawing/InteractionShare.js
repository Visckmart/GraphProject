import {getFormattedTime} from "../Utilities/Utilities.js";
import { loadCategoriesFromStorage } from "./Interaction.js";

//region Exportação

// Exportar Arquivo
export function exportAsFile(graph) {
    let filename = prompt("Nome do arquivo:",
                          `Grafo ${getFormattedTime()}`)
    let content = graph.serialize();
    let encodedContent = 'data:text/plain;charset=utf-8,'
                         + encodeURIComponent(content);

    let element = document.createElement('a');
    element.download = filename;
    element.href = encodedContent;

    element.click();
}


// Exportar Texto
export function exportAsText(graph) {
    alert("Texto para Compartilhamento\n\n" + graph.serialize());
}


// Exportar Link
export function exportAsURL(graph) {
    let serializedGraph = graph.serialize();
    let shareLink = window.location.protocol + "//"
        + window.location.host + window.location.pathname
        + "?graph=" + serializedGraph;
    history.pushState(null, null, shareLink);
}


// Exportar Imagem

// TODO: Organizar um pouco mais
export function exportViewAsImage(graphView) {
    graphView.processingScreenshot = true;

    let textImg = new Image();
    textImg.src = graphView.slowCanvas.toDataURL('image/png');
    graphView.redrawGraph(true);
    let ctx = graphView.canvas.getContext("2d");
    ctx.drawImage(textImg, 0, 0);
    let image = graphView.canvas.toDataURL();

    graphView.processingScreenshot = false;

    let temporaryLink = document.createElement('a');
    temporaryLink.download = `Grafo ${getFormattedTime()}.png`;
    temporaryLink.href = image;

    temporaryLink.click();
}
//endregion


//region Importação

// Importar por Link
export function deserializeURL(graph) {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has("graph") && urlParams.get("graph") !== "") {
        console.log("Deserializing graph " + urlParams.get("graph"));
        graph.loadSerializedGraph(urlParams.get("graph"));
    } else {
        console.log("load from storage")
        loadCategoriesFromStorage()
    }
}

//region Importar por Gesto
export function prepareCanvasSharing(graphView) {
    graphView.canvas.ondragenter = function (event) {
        event.preventDefault();
        graphView.overlay = true;
    };

    graphView.canvas.ondragover = function (event) {
        event.preventDefault();
    };

    graphView.canvas.ondragleave = function (event) {
        event.preventDefault();
        graphView.overlay = false;
    };

    graphView.canvas.ondrop = function (event) {
        event.preventDefault();
        let item = event.dataTransfer.items[0];
        console.log("Dropped", item);

        // Se for arquivo
        if (item.kind === "file") {
            let droppedFile = item.getAsFile();
            let reader = new FileReader();
            reader.onload = function (evt) {
                graphView.loadSerializedGraph(evt.target.result);
            }
            reader.readAsText(droppedFile, "UTF-8");

            // Senão
        } else {
            item.getAsString(str => graphView.loadSerializedGraph(str));
        }
        graphView.overlay = false;
    };
}
//endregion

// Importar Arquivo
export function importFromFile(graphView, event, completionHandler = null) {
    let file = event.target.files[0];
    if (!file) {
        return;
    }

    let reader = new FileReader();
    reader.onload = function (evt) {
        graphView.loadSerializedGraph(evt.target.result);
        if (completionHandler) {
            completionHandler()
        }
    }
    reader.readAsText(file, "UTF-8");
}


// Importação de Texto
export function importFromText(graphView) {
    let serializedInput = prompt("Grafo em Texto");
    graphView.loadSerializedGraph(serializedInput);
}
//endregion