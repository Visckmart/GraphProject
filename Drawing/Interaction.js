import { canvas, Tool, nodeLabelingSelector } from "./General.js"
import { g } from "./GraphView.js"
import ToolRepository from "./ToolRepository.js";
import UndirectedGraph from "../Structure/UndirectedGraph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import BFS from "../Algorithm/BFS.js";

nodeLabelingSelector.onchange = function(e) { g.nodeLabeling = e.target.value }
for(let element of document.querySelector("#tool_tray").children)
{
    if(element.tagName === "INPUT")
    {
        element.addEventListener("change", () => g.changeTool(element.value))
    }

    if(element.tagName === "BUTTON")
    {
        element.addEventListener("click", ToolRepository[element.value].bind(g))
    }
}

let serialTextarea = document.getElementById("serializationText")
serialTextarea.onkeypress = function(event) {
    if (event.key == "Enter") {
        g.structure = UndirectedGraph.deserialize(serialTextarea.value);
        event.preventDefault();
    }
}
let exportButton = document.getElementById("export")
exportButton.onclick = function () {
    serialTextarea.value = g.structure.serialize()
}

let importButton = document.getElementById("import")
importButton.onclick = function () {
    g.structure = UndirectedGraph.deserialize(serialTextarea.value)
}
function deserializeURL() {
    const urlParams = new URLSearchParams(location.search);
    if(urlParams.has("graph") && urlParams.get("graph") != "") {
        console.log("graph", urlParams.get("graph"))
        g.structure = UndirectedGraph.deserialize(urlParams.get("graph"))   
        serialTextarea.value = urlParams.get("graph")
    } else {
        g.structure = new UndirectedGraph();
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

let clearButton = document.getElementById("clear")
clear.onclick = function() {
    history.pushState(null, null, "?")
    deserializeURL()
}

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
