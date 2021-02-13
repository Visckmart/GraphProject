import { canvas, Tool } from "./General.js"
import { g } from "./GraphView.js"
import Graph from "../Structure/Graph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
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

//DEBUG
let runAlgorithmButton = document.getElementById("run_algorithm")
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g)

    await algorithmController.setup(DijkstraShortestPath)
}

// Window Resizing
let blurTimeout = null;
window.onresize = function () {
    // Ajustar posição dos nós
    let widthMult = (window.innerWidth*0.75)/canvas.width;
    let heightMult = (window.innerHeight*0.95)/canvas.height;

    for (let node of g.structure.nodes()) {
        node.pos.x *= widthMult;
        node.pos.y *= heightMult;
    }

    // Ajustar tamanho
    canvas.width = window.innerWidth*0.75;
    canvas.height = window.innerHeight*0.95;

    // Blue
    canvas.style.filter = "blur(15pt)"
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

export let categoryCheckboxes = {
    weightedEdges: document.getElementById('weighedEdges'),
    coloredEdges:  document.getElementById('coloredEdges'),
    directedEdges: document.getElementById('directedEdges')
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
