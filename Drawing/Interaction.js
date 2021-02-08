import { canvas, Tool, nodeLabelingSelector } from "./General.js"
import { g } from "./GraphView.js"
import ToolRepository from "./ToolRepository.js";
import Graph from "../Structure/Graph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import { HighlightType } from "../Structure/Highlights.js"
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";

function updateFavorites() {
    for (let loadFavBtn of loadFavButtons) {
        let favName = "fav"+loadFavBtn.name;
        let hasFavAssociated = window.localStorage.getItem(favName);
        loadFavBtn.disabled = hasFavAssociated == null;
    }
}
let saveFavButtons = document.getElementsByClassName("saveFavorite")
// console.log(saveFavButtons)
let saveFavorite = function() {
    console.log("Salvando", "fav"+this.name)
    window.localStorage.setItem("fav"+this.name, g.structure.serialize())
    updateFavorites()
    // g.structure = UndirectedGraph.deserialize(urlParams.get("graph")) 
}
for (let saveFavBtn of saveFavButtons) {
    saveFavBtn.onclick = saveFavorite
}

let clearFavBtn = document.getElementById("clearFavorites")
clearFavBtn.onclick = function() {
    window.localStorage.clear()
    updateFavorites()
}
let loadFavButtons = document.getElementsByClassName("loadFavorite")
let loadFavorite = function() {
    let ser = window.localStorage.getItem("fav"+this.name)
    console.log("Lendo", "fav"+this.name, ser)
    if (!ser) {
        console.log("Nao tem favorito")
        return;
    }
    g.structure = Graph.deserialize(ser) 
}
updateFavorites()
for (let loadFavBtn of loadFavButtons) {
    loadFavBtn.onclick = loadFavorite
}
nodeLabelingSelector.onchange = function(e) { g.nodeLabeling = e.target.value }
for(let element of document.querySelector("#tool_tray").getElementsByTagName("input")) {
    if (element.name == "tool") {
        element.addEventListener("change", () => g.changeTool(element.value))
    } else if (element.name == "feature") {
        element.addEventListener("change", function() {
            element.checked = false
            ToolRepository[element.value].bind(g)()
        })
    }
}
for (let x of document.querySelector("#tool_tray").getElementsByClassName("icon")) {
    x.addEventListener("mouseenter", function (e) {
        let nodesToDisconnect;
        if (g.selectionHandler.selectedNodes.length > 0) {
            nodesToDisconnect = g.selectionHandler.selectedNodes;
        } else {
            nodesToDisconnect = Array.from(g.structure.nodes())
        }
        if (x.parentElement.previousElementSibling.value == "disconnect_all") {
            for (let [edge, nodeA, nodeB] of g.structure.uniqueEdges()) {
                if (nodesToDisconnect.includes(nodeA) || nodesToDisconnect.includes(nodeB)) {
                    edge.highlights.add(HighlightType.FEATURE_PREVIEW)
                }
            }
        }
    })

    x.addEventListener("mouseleave", function (e) {
        // console.log(x.parentElement.previousElementSibling.value)
        if (x.parentElement.previousElementSibling.value == "disconnect_all") {
            for (let [edge, ,] of g.structure.uniqueEdges()) {
                edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
            }
        }
    })
    // x.style.backgroundColor = "red"
}

function deserializeURL() {
    const urlParams = new URLSearchParams(location.search);
    if(urlParams.has("graph") && urlParams.get("graph") != "") {
        console.log("Deserializing graph " + urlParams.get("graph"))
        g.structure = Graph.deserialize(urlParams.get("graph"))
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

//DEBUG
let runAlgorithmButton = document.getElementById("run_algorithm")
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g)

    await algorithmController.setup(DijkstraShortestPath)
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

function updateEdge() {
    g.updateEdgeType(
        document.getElementById('weighedEdges').checked,
        document.getElementById('coloredEdges').checked,
        document.getElementById('directedEdges').checked
    )
}
//Opções de formato de grafo
document.getElementById('weighedEdges').addEventListener('change', updateEdge)

// Executa a primeira vez
g.refreshInterfaceState();
