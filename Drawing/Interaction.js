import { Tool } from "./General.js"
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
            categoryCheckboxes.directedEdges.disabled = false;
            break
        case 'EdmondsMSA':
            categoryCheckboxes.weightedEdges.disabled = true;
            categoryCheckboxes.weightedEdges.checked = true;
            categoryCheckboxes.coloredEdges.disabled = false;
            categoryCheckboxes.directedEdges.disabled = true;
            categoryCheckboxes.directedEdges.checked = true;
            break
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
    g.updateEdgeType(
        categoryCheckboxes.weightedEdges.checked,
        categoryCheckboxes.coloredEdges.checked,
        categoryCheckboxes.directedEdges.checked
    )
    g.updateNodeType(
        categoryCheckboxes.coloredNodes.checked
    )
}
//Opções de formato de grafo
categoryCheckboxes.coloredNodes.addEventListener('change', updateGraph)
categoryCheckboxes.weightedEdges.addEventListener('change', updateGraph)
categoryCheckboxes.directedEdges.addEventListener('change', updateGraph)

// Executa a primeira vez
g.refreshInterfaceState();
