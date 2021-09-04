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

import FavoritesHandler from "../Utilities/FavoritesHandler.js";
import { Algorithm, GraphCategory } from "./General.js";
// import { getAlgorithmFromName } from "./Interaction.js";
import AlgorithmController from "../Algorithm/Control/AlgorithmController.js";
import { g } from "./GraphView.js";

export default class GraphMenuHandler {

    constructor(view) {
        this.graphView = view;
        this.favoritesHandler = new FavoritesHandler(this.refreshMenuFromGraph.bind(this))
        this.favoritesHandler.updateFavorites();


        this.algorithmSelector = document.getElementById("algorithm")
        this.algorithmSelector.onchange = (event) => {
            this.selectedAlgorithm = event.target.value;
        }
        this.runAlgorithmButton = document.getElementById("run_algorithm")

        this.runAlgorithmButton.onclick = async () => {
            let algorithmController = new AlgorithmController(g);
            let algorithm = await getAlgorithmModuleFromName(this.algorithmSelector.value);
            if (!algorithm) {
                console.error("Algoritmo selecionado não foi encontrado.");
                return;
            }
            await algorithmController.setup(algorithm);
        }


        this.categoryCheckboxes = {
            [GraphCategory.COLORED_NODES]:  document.getElementById('coloredNodes'),

            [GraphCategory.DIRECTED_EDGES]: document.getElementById('directedEdges'),
            [GraphCategory.WEIGHTED_EDGES]: document.getElementById('weightedEdges'),
            // [GraphCategory.COLORED_EDGES]:  document.getElementById('coloredEdges')
        }
        this.categoryCheckboxes[GraphCategory.COLORED_NODES].onchange = this.didChangeCheckbox.bind(this)
        this.categoryCheckboxes[GraphCategory.WEIGHTED_EDGES].onchange = this.didChangeCheckbox.bind(this)
        this.categoryCheckboxes[GraphCategory.DIRECTED_EDGES].onchange = this.didChangeCheckbox.bind(this)

    }

    _selectedAlgorithm = null;
    set selectedAlgorithm(newValue) {
        this._selectedAlgorithm = newValue;
        this.algorithmSelector.value = this._selectedAlgorithm;
        this.didSelectAlgorithm(this._selectedAlgorithm);
    }
    get selectedAlgorithm() {
        return this._selectedAlgorithm;
    }

    didSelectAlgorithm(selectedAlgorithm) {
        // Remover foco do seletor
        this.algorithmSelector.blur();

        // Obter as restrições impostas pelo algoritmo escolhido
        let categoryRestrictions = getCategoryRestrictions(selectedAlgorithm);
        // Atualizar as checkboxes de acordo com as instruções
        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            let restriction = categoryRestrictions[category];
            if (restriction == null) {
                // Se não houver restrição
                checkbox.disabled = false;
            } else {
                // Se houver alguma restrição
                checkbox.disabled = true;
                checkbox.checked = restriction;
            }
        }
        // Armazenar a escolha mais recente
        window.localStorage.setItem("selectedAlgorithm", selectedAlgorithm);
        // Atualizar o grafo apropriadamente
        this.didChangeCheckbox();
    }

    didChangeCheckbox() {
        let enabledCategories = [];
        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            // Armazenando a escolha
            window.localStorage.setItem(category, checkbox.checked);
            // Obtendo as categorias selecionadas
            if (checkbox.checked) {
                enabledCategories.push(category);
            }
        }
        this.graphView.updateGraphConstructors(enabledCategories);
    }

    loadCategoriesFromStorage() {
        console.log("Preparando menu lateral usando informações anteriores");

        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            // Obtém o estado salvo da categoria atual
            let storedState = window.localStorage.getItem(category);

            checkbox.checked = storedState == "true";

            // Ativa por padrão a coloração dos nós
            if (category == GraphCategory.COLORED_NODES && storedState == null) {
                checkbox.checked = true;
            }
        }

        let storedAlgorithm = window.localStorage.getItem("selectedAlgorithm");
        if (storedAlgorithm) {
            this.selectedAlgorithm = storedAlgorithm;
        }
    }

    refreshMenuFromGraph() {
        let graphCategories = this.graphView.structure.getCategories();

        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            checkbox.checked = graphCategories.has(category);
        }

        let storedAlgorithm = window.localStorage.getItem("selectedAlgorithm");
        // Se qualquer restrição do algoritmo for incompatível com
        // as checkboxes, retorne
        let categoriesRestrictions = getCategoryRestrictions(storedAlgorithm);
        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            let restriction = categoriesRestrictions[category];
            if (restriction != null && restriction != checkbox.checked) {
                console.log(restriction, checkbox.checked)
                return;
            }
        }

        // Se todas as restrições forem compatíveis então selecione o algoritmo
        if (storedAlgorithm) {
            this.selectedAlgorithm = storedAlgorithm;
        }
    }
}

function getCategoryRestrictions(algorithmName) {
    let boundCategories = {};
    switch (algorithmName) {
    case 'DFS':
        break;
    case 'BFS':
        break;
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


export async function getAlgorithmModuleFromName(algorithmName) {
    let algModuleName;
    switch (algorithmName) {
    case Algorithm.DFS:
        algModuleName = 'DFS'
        break;
    case Algorithm.BFS:
        algModuleName = 'BFS';
        break;
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