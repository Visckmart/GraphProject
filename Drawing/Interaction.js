import { canvas, Tool } from "./General.js"
import { g } from "./GraphView.js"
import Graph from "../Structure/Graph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
import PrimMST from "../Algorithm/PrimMST.js";
import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";

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

export let categoryCheckboxes = {
    weightedEdges: document.getElementById('weighedEdges'),
    coloredEdges:  document.getElementById('coloredEdges'),
    directedEdges: document.getElementById('directedEdges')
}
let algorithmSelector = document.getElementById("algorithm")
algorithmSelector.onchange = function () {
    switch (this.value) {
        case 'Dijkstra':
        default:
            categoryCheckboxes.weightedEdges.disabled = false;
            categoryCheckboxes.coloredEdges.disabled = false;
            categoryCheckboxes.directedEdges.disabled = false;
            break
        case 'PrimMST':
            categoryCheckboxes.weightedEdges.disabled = true;
            categoryCheckboxes.weightedEdges.checked = true;
            categoryCheckboxes.coloredEdges.disabled = false;
            categoryCheckboxes.directedEdges.disabled = false;
            break
        case 'DFSCycleDetection':
            categoryCheckboxes.weightedEdges.disabled = false;
            categoryCheckboxes.coloredEdges.disabled = false;
            categoryCheckboxes.directedEdges.disabled = true;
            categoryCheckboxes.directedEdges.checked = false;
            break
    }
    updateEdge()
}
let runAlgorithmButton = document.getElementById("run_algorithm")
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g)

    switch (algorithmSelector.value) {
        case 'Dijkstra':
        default:
            await algorithmController.setup(DijkstraShortestPath)
            break
        case 'PrimMST':
            await algorithmController.setup(PrimMST)
            break
        case 'DFSCycleDetection':
            await algorithmController.setup(DFSCycleDetection)
            break
    }
}

// Window Resizing
let blurTimeout = null;
window.onresize = function () {
    // Ajustar posição dos nós
    g.recalculateNodePositions();

    // Ajustar tamanho
    canvas.width = window.innerWidth*0.75;
    canvas.height = window.innerHeight*0.95;

    // Blue
    canvas.style.filter = "blur(20pt)"
    if (blurTimeout) { clearTimeout(blurTimeout); }
    blurTimeout = setTimeout(function() {
        canvas.style.filter = null;
    }, 250);
    g.redrawGraph();
}

/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function() {
    if (g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    g.refreshInterfaceState()
}

function updateEdge() {
    g.updateEdgeType(
        categoryCheckboxes.weightedEdges.checked,
        categoryCheckboxes.coloredEdges.checked,
        categoryCheckboxes.directedEdges.checked
    )
}
//Opções de formato de grafo
categoryCheckboxes.weightedEdges.addEventListener('change', updateEdge)

// Executa a primeira vez
g.refreshInterfaceState();
