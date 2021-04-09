// Arquivos css
import "../Pages/tool_tray.css"

import { Algorithm, GraphCategory, Tool } from "./General.js"
import { g } from "../index.js"
import AlgorithmController from "../Algorithm/Control/AlgorithmController.js";
// import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
// import PrimMST from "../Algorithm/PrimMST.js";
// import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";
// import KruskalMST from "../Algorithm/KruskalMST.js";
// import EdmondsMSA from "../Algorithm/EdmondsMSA.js";
import {updateFavorites} from "../Utilities/FavoritesHandler.js";
// import EulerianPath from "../Algorithm/EulerianPath.js";
// import FordFulkerson from "../Algorithm/FordFulkerson.js";

updateFavorites()

export let categoryCheckboxes = {
    [GraphCategory.COLORED_NODES]:  document.getElementById('coloredNodes'),

    [GraphCategory.DIRECTED_EDGES]: document.getElementById('directedEdges'),
    [GraphCategory.WEIGHTED_EDGES]: document.getElementById('weightedEdges'),
    [GraphCategory.COLORED_EDGES]:  document.getElementById('coloredEdges')
}

let algorithmSelector = document.getElementById("algorithm")

algorithmSelector.onchange = function () {
    algorithmSelector.blur()
    let boundCategories = getRequiredCategoriesForAlgorithm(this.value)
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        let boundStatus = boundCategories[category]
        if (boundStatus == null) {
            checkbox.disabled = false;
        } else {
            checkbox.disabled = true;
            checkbox.checked = boundStatus;
        }
    }
    window.localStorage.setItem("selectedAlgorithm", algorithmSelector.value)
    updateGraph()
}
function getRequiredCategoriesForAlgorithm(alg) {
    let boundCategories = {};
    switch (alg) {
    case 'PrimMST':
        boundCategories[GraphCategory.WEIGHTED_EDGES] = true;
        boundCategories[GraphCategory.DIRECTED_EDGES] = false;
        break;
    case 'KruskalMST':
        boundCategories[GraphCategory.WEIGHTED_EDGES] = true;
        break;
    case 'EdmondsMSA':
        boundCategories[GraphCategory.WEIGHTED_EDGES] = true;
        boundCategories[GraphCategory.DIRECTED_EDGES] = true;
        break;
    case 'FordFulkerson':
        boundCategories[GraphCategory.DIRECTED_EDGES] = true;
        boundCategories[GraphCategory.WEIGHTED_EDGES] = true;
        break;
    case 'GreedyNodeColoring':
        boundCategories[GraphCategory.COLORED_NODES] = true;
        break;
    default:
        break;
    }
    return boundCategories;
}
let runAlgorithmButton = document.getElementById("run_algorithm")
export async function getAlgorithmFromName(name) {
    let algModuleName;
    switch (name) {
        case Algorithm.DIJKSTRA:
            algModuleName = "DijkstraShortestPath";
            break;
        case Algorithm.MST_PRIM:
            algModuleName = "PrimMST";
            break;
        case Algorithm.MST_KRUSKAL:
            algModuleName = "KruskalMST";
            break;
        case Algorithm.DFS_CYCLEDETECTION:
            algModuleName = "DFSCycleDetection";
            break;
        case Algorithm.MSA_EDMONDS:
            algModuleName = "EdmondsMSA";
            break;
        case Algorithm.EULERIANPATH:
            algModuleName = "EulerianPath";
            break;
        case Algorithm.FORD_FULKERSON:
            algModuleName = "FordFulkerson";
            break;
        case Algorithm.GREEDY_NODE_COLOR:
            algModuleName = "GreedyNodeColoring";
            break;
    }
    if (algModuleName) {
        let algModule = await import("../Algorithm/"+algModuleName+".js");
        return algModule.default;
    }
    return null;
}
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g);
    let algorithm = await getAlgorithmFromName(algorithmSelector.value);
    if (!algorithm) return;
    await algorithmController.setup(algorithm);
}

// Window Resizing
// window.onresize = g.recalculateLayout.bind(g)
// g.recalculateLayout()
/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function() {
    if (!g.lastToolChoice || g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
}

function updateGraph() {
    let enabledCategories = []
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        window.localStorage.setItem(category, checkbox.checked)
        if (checkbox.checked) { enabledCategories.push(category) }
    }
    g.updateGraphConstructors(enabledCategories)
}

// TODO: Quebrei isso pra tirar a dependência
function refreshInterfaceCategories() {
    let categoriesState = g.structure.getCategories();
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        checkbox.checked = categoriesState.has(category);
    }
}


for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
    let storedState = window.localStorage.getItem(category)
    checkbox.checked = storedState == "true"
    if (category == GraphCategory.COLORED_NODES && storedState == null) {
        checkbox.checked = true
    }
}
let storedAlgorithm = window.localStorage.getItem("selectedAlgorithm")
if (storedAlgorithm) {
    algorithmSelector.value = storedAlgorithm
}
updateGraph()
//Opções de formato de grafo
categoryCheckboxes[GraphCategory.COLORED_NODES].addEventListener('change', updateGraph)
categoryCheckboxes[GraphCategory.WEIGHTED_EDGES].addEventListener('change', updateGraph)
categoryCheckboxes[GraphCategory.DIRECTED_EDGES].addEventListener('change', updateGraph)

// Executa a primeira vez
// g.refreshTrayIcons();

// Seletor de label de nó
export let nodeLabelingSelector = document.getElementById("nodeLabeling")
nodeLabelingSelector.onchange = function(e) {
    g.nodeLabeling = e.target.value;
    g.refreshGraph();
}