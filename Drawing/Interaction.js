/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Algorithm, GraphCategory } from "./General.js"
import { g } from "./GraphView.js"
import AlgorithmController from "../Algorithm/Control/AlgorithmController.js";
// import DijkstraShortestPath from "../Algorithm/DijkstraShortestPath.js";
// import PrimMST from "../Algorithm/PrimMST.js";
// import DFSCycleDetection from "../Algorithm/DFSCycleDetection.js";
// import KruskalMST from "../Algorithm/KruskalMST.js";
// import EdmondsMSA from "../Algorithm/EdmondsMSA.js";
import { updateFavorites } from "../Utilities/FavoritesHandler.js";
// import EulerianPath from "../Algorithm/EulerianPath.js";
// import FordFulkerson from "../Algorithm/FordFulkerson.js";

updateFavorites()

export let categoryCheckboxes = {
    [GraphCategory.COLORED_NODES]:  document.getElementById('coloredNodes'),

    [GraphCategory.DIRECTED_EDGES]: document.getElementById('directedEdges'),
    [GraphCategory.WEIGHTED_EDGES]: document.getElementById('weightedEdges'),
    // [GraphCategory.COLORED_EDGES]:  document.getElementById('coloredEdges')
}

let algorithmSelector = document.getElementById("algorithm")

algorithmSelector.onchange = (event) => refreshCheckboxesFromAlgorithm(event.target.value)

function refreshCheckboxesFromAlgorithm(selectedAlgorithm) {
    console.log("selectedAlgorithm", selectedAlgorithm)
    algorithmSelector.blur()
    let boundCategories = getRequiredCategoriesForAlgorithm(selectedAlgorithm)
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        let boundStatus = boundCategories[category]
        if (boundStatus == null) {
            checkbox.disabled = false;
        } else {
            checkbox.disabled = true;
            checkbox.checked = boundStatus;
        }
    }
    window.localStorage.setItem("selectedAlgorithm", selectedAlgorithm)
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
    // case 'EdmondsMSA':
    //     boundCategories[GraphCategory.WEIGHTED_EDGES] = true;
    //     boundCategories[GraphCategory.DIRECTED_EDGES] = true;
    //     break;
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
        // case Algorithm.MSA_EDMONDS:
        //     algModuleName = "EdmondsMSA";
        //     break;
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
window.onresize = g.recalculateLayout.bind(g)
g.recalculateLayout()
/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function() {
    // if (!g.lastToolChoice || g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = g.keyboardHandler.lastToolChoice;
    // }
}

function updateGraph() {
    console.log("updateGraph")
    // console.trace()
    let enabledCategories = []
    for (let [category, checkbox] of Object.entries(categoryCheckboxes)) {
        window.localStorage.setItem(category, checkbox.checked)
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
// updateGraph()
export function loadCategoriesFromStorage() {
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
        refreshCheckboxesFromAlgorithm(storedAlgorithm)
    }
}
//Opções de formato de grafo
categoryCheckboxes[GraphCategory.COLORED_NODES].addEventListener('change', updateGraph)
categoryCheckboxes[GraphCategory.WEIGHTED_EDGES].addEventListener('change', updateGraph)
categoryCheckboxes[GraphCategory.DIRECTED_EDGES].addEventListener('change', updateGraph)

// Executa a primeira vez
// g.refreshTrayIcons();
