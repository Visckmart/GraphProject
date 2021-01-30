import { canvas, Tool, nodeLabelingSelector } from "./General.js"
import { g } from "./GraphView.js"
import ToolRepository from "./ToolRepository.js";
import UndirectedGraph from "../Structure/UndirectedGraph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import BFS from "../Algorithm/BFS.js";

nodeLabelingSelector.onchange = function(e) { g.nodeLabeling = e.target.value }
for(let element of document.querySelector("#tool_tray").getElementsByTagName("input")) {
    element.addEventListener("change", () => g.changeTool(element.value))
}

canvas.ondrop = function(ev) {
    console.log("Dropped file", ev.dataTransfer.items[0]);
    let droppedFile = ev.dataTransfer.items[0].getAsFile();
    var reader = new FileReader();
    reader.onload = function (evt) {
        console.log("Read content:", evt.target.result)
        g.structure = UndirectedGraph.deserialize(evt.target.result)  
    }
    reader.readAsText(droppedFile, "UTF-8");
    ev.preventDefault();
    g.overlay = false;
};

canvas.ondragenter = function(e) {
    console.log("Drag enter")
    e.dataTransfer.dropEffect = 'move'
    g.overlay = true;
    e.preventDefault();
    return false;
 };

canvas.ondragover = function (e) {
    console.log("Drag over")
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
    return false;
 };

canvas.ondragleave = function (e) {
    console.log("Drag leave")
    e.preventDefault();
    g.overlay = false;
    return false;
 };

canvas.ondragend = function (e) {
    console.log("Drag end")
    e.preventDefault();
    g.overlay = false;
    return false;
 };

let exportLinkButton = document.getElementById("exportLink")
exportLinkButton.onclick = function () {
    let shareLink = window.location.protocol + "//" + window.location.host + window.location.pathname+"?graph="+g.structure.serialize();
    alert("Link de Compartilhamento\n\n" + shareLink)
}

let exportTextButton = document.getElementById("exportText")
exportTextButton.onclick = function () {
    alert("Texto para Compartilhamento\n\n" + g.structure.serialize())
}

function download(file, text) { 
    //creating an invisible element 
    var element = document.createElement('a'); 
    element.setAttribute('href',  
    'data:text/plain;charset=utf-8,' 
    + encodeURIComponent(text)); 
    element.setAttribute('download', file); 
  
    // Above code is equivalent to 
    // <a href="path of file" download="file name"> 
  
    document.body.appendChild(element); 
  
    //onClick property 
    element.click(); 
  
    document.body.removeChild(element); 
} 

let exportFileButton = document.getElementById("exportFile")
exportFileButton.onclick = function() { 
    const d = new Date()
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    const h = new Intl.DateTimeFormat('en', { hour12: false, hour: '2-digit' }).format(d);
    const m = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
  
    download(`Grafo ${da}-${mo}-${ye} ${h}:${m}.gp`, g.structure.serialize()); 
}

// let importButton = document.getElementById("import")
// importButton.onclick = function () {
//     g.structure = UndirectedGraph.deserialize(serialTextarea.value)
// }
function deserializeURL() {
    const urlParams = new URLSearchParams(location.search);
    if(urlParams.has("graph") && urlParams.get("graph") != "") {
        console.log("Deserializing graph " + urlParams.get("graph"))
        g.structure = UndirectedGraph.deserialize(urlParams.get("graph"))   
        // serialTextarea.value = urlParams.get("graph")
    }
    g.redrawGraph()
    g.updateAnimations()
}
window.addEventListener("load", deserializeURL);
window.onpopstate = deserializeURL;

let share = document.getElementById("share")
share.onclick = function() {
    let serialized = g.structure.serialize()

    console.log(serialized, serialized.length)
    history.pushState(null, null, "?graph="+serialized)
}

// let clearButton = document.getElementById("clear")
// clear.onclick = function() {
//     history.pushState(null, null, "?")
//     deserializeURL()
// }

//DEBUG
let runAlgorithmButton = document.getElementById("run_algorithm")
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g)

    await algorithmController.setup(BFS)
}

let blurTimeout = null
window.onresize = function (a) {
    let wr = (window.innerWidth*0.75)/canvas.width
    let wh = (window.innerHeight*0.95)/canvas.height
    canvas.width = window.innerWidth*0.75;
    canvas.height = window.innerHeight*0.95;
    for (let node of g.structure.nodes()) {
        node.pos.x *= wr
        node.pos.y *= wh
    }
    canvas.style.filter = "blur(15pt)"
    if (blurTimeout) { clearTimeout(blurTimeout) }
    blurTimeout = setTimeout(function() {
        canvas.style.filter = null
    }, 250)
    g.redrawGraph()
}

/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function(e) {
    if (g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    g.refreshInterfaceState()
}

// Executa a primeira vez
g.refreshInterfaceState();
