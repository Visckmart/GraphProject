import { GraphCategory, Tool } from "./General.js"
import { g } from "./GraphView.js"
import Graph from "../Structure/Graph.js"
import AlgorithmController from "./AlgorithmControls/AlgorithmController.js";
import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
import PrimMST from "../Algorithm/PrimMST.js";
import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";
import KruskalMST from "../Algorithm/KruskalMST.js";
import EdmondsMSA from "../Algorithm/EdmondsMSA.js";
import {updateFavorites} from "./FavoritesHandler.js";
import EulerianPath from "../Algorithm/EulerianPath.js";

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
    let requiredCategories = getRequiredCategoriesForAlgorithm(this.value)
    console.log(requiredCategories)
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        if (requiredCategories[category]) {
            checkbox.disabled = true
            checkbox.checked = true
        } else {
            checkbox.disabled = false;
        }
    }
    updateGraph()
}
let runAlgorithmButton = document.getElementById("run_algorithm")
runAlgorithmButton.onclick = async () => {
    let algorithmController = new AlgorithmController(g)
    // TODO: (V) Seleção dos algoritmos deveria ser feita de forma unificada (KeyboardHandler)
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
        case 'EdmondsMSA':
            await algorithmController.setup(EdmondsMSA)
        break
        case 'EulerianPath':
            await algorithmController.setup(EulerianPath)
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
    let enabledCategories = []
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        if (checkbox.checked) { enabledCategories.push(category) }
    }
    console.log(enabledCategories)
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
g.refreshInterfaceState();
