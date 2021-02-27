import { Tool } from "./General.js"
import { g } from "./GraphView.js"
import Graph from "../Structure/Graph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
import PrimMST from "../Algorithm/PrimMST.js";
import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";
import KruskalMST from "../Algorithm/KruskalMST.js";

let favoritesSection = document.getElementById("favoritesList")
let favoriteTemplate = document.querySelector("#favoriteRow")
let newFavoriteTemplate = document.querySelector("#favoriteNewRow")
let favoriteDeleteTemplate = document.querySelector("#favoriteDeleteConfirmationRow")
let deletingFavorite = null;
function updateFavorites() {
    favoritesSection.innerHTML = "";
    let favoriteKeys = []
    for (let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i)
            if (key.includes("fav", 0)) {
                favoriteKeys.push(key)
            }
    }
    favoriteKeys.sort((a,b) => { return a.toLowerCase() > b.toLowerCase() })
    for (let key of favoriteKeys) {
        if (deletingFavorite != key) {
            let newFavoriteRow = favoriteTemplate.content.cloneNode(true);
            newFavoriteRow.getElementById("inputLabel").value = key.substr(3)
            let labelInput = newFavoriteRow.getElementById("inputLabel")
            labelInput.onchange = function(event) {
                let newName = event.target.value
                if (!newName
                    || window.localStorage.getItem("fav"+newName) != null) {
                    return;
                }
                let current = window.localStorage.getItem(key)
                window.localStorage.removeItem(key)
                window.localStorage.setItem("fav"+newName, current)
                // window.localStorage.setItem("fav"+event.target.value+9, current)
                updateFavorites()
            }
            labelInput.onblur = () => {
                labelInput.value = key.substr(3)
            }
            let loadBtn = newFavoriteRow.getElementById("loadFavorite")
            loadBtn.name = key
            loadBtn.onclick = () => {
                g.loadSerializedGraph(window.localStorage.getItem(key))
                updateFavorites()
            }
            let removeBtn = newFavoriteRow.getElementById("removeFavorite")
            removeBtn.name = key
            removeBtn.onclick = () => {
                deletingFavorite = key;
                updateFavorites()
            }
            favoritesSection.appendChild(newFavoriteRow)
        } else {
            let newDeleteRow = favoriteDeleteTemplate.content.cloneNode(true);
            let cancelBtn = newDeleteRow.getElementById("cancelDeletion")
            cancelBtn.onclick = () => {
                deletingFavorite = null;
                updateFavorites()
            }
            let confirmBtn = newDeleteRow.getElementById("confirmDeletion")
            confirmBtn.onclick = () => {
                deletingFavorite = null;
                window.localStorage.removeItem(key)
                updateFavorites()
            }
            favoritesSection.appendChild(newDeleteRow)
        }
    }
    let newFavorite = newFavoriteTemplate.content.cloneNode(true);
    let newFavoriteBtn = newFavorite.getElementById("newFavorite");
    newFavoriteBtn.onclick = () => {
        let newName = "Favorito";
        let offset = 1;
        do {
            newName = `Favorito ${window.localStorage.length + offset}`;
            offset += 1;
        } while (window.localStorage.getItem("fav" + newName) != null);
        window.localStorage.setItem("fav" + newName, g.structure.serialize());
        updateFavorites();

        let mBody = document.getElementsByClassName("menuBody")[0];
        mBody.scrollTop = mBody.scrollHeight;
    }
    favoritesSection.appendChild(newFavorite)
}

updateFavorites()

export let categoryCheckboxes = {
    coloredNodes: document.getElementById('coloredNodes'),
    weightedEdges: document.getElementById('weighedEdges'),
    coloredEdges:  document.getElementById('coloredEdges'),
    directedEdges: document.getElementById('directedEdges')
}
let algorithmSelector = document.getElementById("algorithm")
algorithmSelector.onchange = function () {
    algorithmSelector.blur()
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
            categoryCheckboxes.directedEdges.checked = false;
            break
        case 'KruskalMST':
            categoryCheckboxes.weightedEdges.disabled = true;
            categoryCheckboxes.weightedEdges.checked = true;
            categoryCheckboxes.coloredEdges.disabled = false;
            categoryCheckboxes.directedEdges.disabled = false;
            categoryCheckboxes.directedEdges.checked = false;
            break
        case 'DFSCycleDetection':
            categoryCheckboxes.weightedEdges.disabled = false;
            categoryCheckboxes.coloredEdges.disabled = false;
            categoryCheckboxes.directedEdges.disabled = true;
            categoryCheckboxes.directedEdges.checked = false;
            break
    }
    updateGraph()
}
let runAlgorithmButton = document.getElementById("run_algorithm")
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g)

    switch (algorithmSelector.value) {
        case 'Dijkstra':
            await algorithmController.setup(DijkstraShortestPath)
            break
        case 'PrimMST':
            await algorithmController.setup(PrimMST)
            break
        case 'KruskalMST':
            await algorithmController.setup(KruskalMST)
            break
        case 'DFSCycleDetection':
            await algorithmController.setup(DFSCycleDetection)
            break
    default:
        break;
    }
}

// Window Resizing
window.onresize = g.recalculateLayout.bind(g)
g.recalculateLayout()
/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function() {
    if (!g.lastToolChoice || g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    g.refreshInterfaceState()
}

function updateGraph() {
    g.updateEdgeType(
        categoryCheckboxes.weightedEdges.checked,
        categoryCheckboxes.coloredEdges.checked,
        categoryCheckboxes.directedEdges.checked
    )
    g.updateNodeType(
        categoryCheckboxes.coloredNodes.checked
    )
    console.log(g.structure)
}
//Opções de formato de grafo
categoryCheckboxes.coloredNodes.addEventListener('change', updateGraph)
categoryCheckboxes.weightedEdges.addEventListener('change', updateGraph)
categoryCheckboxes.directedEdges.addEventListener('change', updateGraph)

// Executa a primeira vez
g.refreshInterfaceState();
