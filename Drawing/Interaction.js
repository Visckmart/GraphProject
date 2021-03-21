import { Algorithm, GraphCategory, Tool } from "./General.js"
import { g } from "./GraphView.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
import PrimMST from "../Algorithm/PrimMST.js";
import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";
import KruskalMST from "../Algorithm/KruskalMST.js";
import EdmondsMSA from "../Algorithm/EdmondsMSA.js";
import {updateFavorites} from "./FavoritesHandler.js";
import EulerianPath from "../Algorithm/EulerianPath.js";
import FordFulkerson from "../Algorithm/FordFulkerson.js";

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
    updateGraph()
}
function getRequiredCategoriesForAlgorithm(alg) {
    console.log(alg)
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
    default:
        break;
    }
    return boundCategories;
}
let runAlgorithmButton = document.getElementById("run_algorithm")
export function getAlgorithmFromName(name) {
    switch (name) {
        case Algorithm.DIJKSTRA:           return DijkstraShortestPath;
        case Algorithm.MST_PRIM:           return PrimMST;
        case Algorithm.MST_KRUSKAL:        return KruskalMST;
        case Algorithm.DFS_CYCLEDETECTION: return DFSCycleDetection;
        case Algorithm.MSA_EDMONDS:        return EdmondsMSA;
        case Algorithm.EULERIANPATH:       return EulerianPath;
        case Algorithm.FORD_FULKERSON:     return FordFulkerson;
    }
    return null;
}
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g);
    let algorithm = getAlgorithmFromName(algorithmSelector.value);
    await algorithmController.setup(algorithm);
}

// Window Resizing
window.onresize = g.recalculateLayout.bind(g)
g.recalculateLayout()
/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function() {
    if (!g.lastToolChoice || g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    g.refreshTrayIcons()
}

function updateGraph() {
    let enabledCategories = []
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        if (checkbox.checked) { enabledCategories.push(category) }
    }
    g.updateGraphConstructors(enabledCategories)
}

export function refreshInterfaceCategories() {
    let categoriesState = g.structure.getCategories();
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        checkbox.checked = categoriesState.has(category);
    }
}
//Opções de formato de grafo
categoryCheckboxes[GraphCategory.COLORED_NODES].addEventListener('change', updateGraph)
categoryCheckboxes[GraphCategory.WEIGHTED_EDGES].addEventListener('change', updateGraph)
categoryCheckboxes[GraphCategory.DIRECTED_EDGES].addEventListener('change', updateGraph)

// Executa a primeira vez
g.refreshTrayIcons();
