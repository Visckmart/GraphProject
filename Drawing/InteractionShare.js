import { canvas } from "./General.js"
import { g } from "./GraphView.js"
import Graph from "../Structure/Graph.js"

// EXPORTAÇÃO

// Arquivo
let exportFileButton = document.getElementById("exportFile")
function getTimeForFilename() {
    const hoje = new Date()
    const ano = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(hoje);
    const mes = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(hoje);
    const dia = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(hoje);
    const hora = new Intl.DateTimeFormat('en', { hour12: false, hour: '2-digit' }).format(hoje);
    const minuto = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(hoje);

    return `${dia}-${mes}-${ano} ${hora}:${minuto}`
}

exportFileButton.onclick = function() { 
    let content = g.structure.serialize()
    let name = `Grafo ${getTimeForFilename()}.gp`

    var element = document.createElement('a'); 
    element.setAttribute('href',
                         'data:text/plain;charset=utf-8,'
                         + encodeURIComponent(content)); 
    element.setAttribute('download', name); 
  
    // document.body.appendChild(element);
    element.click();
    // document.body.removeChild(element);
}

// Texto
let exportTextButton = document.getElementById("exportText")
exportTextButton.onclick = function () {
    alert("Texto para Compartilhamento\n\n" + g.structure.serialize())
}

// Link
let exportLinkButton = document.getElementById("exportLink")
exportLinkButton.onclick = function () {
    let shareLink = window.location.protocol + "//" + window.location.host
                    + window.location.pathname
                    + "?graph=" + g.structure.serialize();
    history.pushState(null, null, shareLink)
}

let exportImageButton = document.getElementById("exportImage")
exportImageButton.onclick = function () {
    // get canvas data  
    var image = canvas.toDataURL();  
  
    // create temporary link  
    var tmpLink = document.createElement( 'a' );  
    tmpLink.download = 'image.png'; // set the name of the download file 
    tmpLink.href = image;  
  
    // temporarily add link to body and initiate the download  
    document.body.appendChild( tmpLink );  
    tmpLink.click();  
    document.body.removeChild( tmpLink );  
}



// IMPORTAÇÃO

canvas.ondragenter = function(event) {
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

canvas.ondrop = function(event) {
    event.preventDefault();
    let item = event.dataTransfer.items[0];
    console.log("Dropped", item);
    // Se for arquivo
    if (item.kind == "file") {
        let droppedFile = item.getAsFile();
        let reader = new FileReader();
        reader.onload = function (evt) {
            console.log("Read content:", evt.target.result)
            g.structure = Graph.deserialize(evt.target.result)
        }
        reader.readAsText(droppedFile, "UTF-8");
    // Senão
    } else {
        item.getAsString(function(str) {
            g.structure = Graph.deserialize(str);
        });
    }
    g.overlay = false;
};


let fileInputElement = document.getElementById("inputFile")
fileInputElement.onchange = function(event) {
    let file = event.target.files[0]
    if (file) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            console.log("Read content:", evt.target.result)
            g.structure = Graph.deserialize(evt.target.result)
        }
        reader.readAsText(file, "UTF-8");
    }
}
let importFile = document.getElementById("importFile")
importFile.onclick = function (e) {
    fileInputElement.click()
}

let importText = document.getElementById("importText")
importText.onclick = function () {
    let t = prompt("Grafo em Texto")
    g.structure = Graph.deserialize(t)
}