// Arquivos css
import "../Pages/tool_tray.css"

import { Algorithm, GraphCategory, Tool } from "./General.js"

export default class Interaction {
    constructor(g) {
        this.graphView = g

        this.setupAlgorithmSelector()
        this.setupRunAlgorithm()
        this.setupCategories()
        this.setupLabeling()

        // TODO: Isso precisa estar aqui mesmo?
        /* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
        document.body.onblur = function() {
            if (!this.graphView.lastToolChoice || this.graphView.lastToolChoice === Tool.MOVE) {
                this.graphView.primaryTool = Tool.MOVE;
            }
        }

        this.updateGraphCategories()
    }
    categoryCheckboxes = {
        [GraphCategory.COLORED_NODES]:  document.getElementById('coloredNodes'),
        [GraphCategory.DIRECTED_EDGES]: document.getElementById('directedEdges'),
        [GraphCategory.WEIGHTED_EDGES]: document.getElementById('weightedEdges'),
        [GraphCategory.COLORED_EDGES]:  document.getElementById('coloredEdges')
    }

    // region Setup
    setupAlgorithmSelector() {
        this.algorithmSelector = document.getElementById("algorithm")
        this.algorithmSelector.onchange = () => {
            this.algorithmSelector.blur()
            let boundCategories = this.getRequiredCategoriesForAlgorithm(this.algorithmSelector.value)
            for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
                let boundStatus = boundCategories[category]
                if (boundStatus == null) {
                    checkbox.disabled = false;
                } else {
                    checkbox.disabled = true;
                    checkbox.checked = boundStatus;
                }
            }
            window.localStorage.setItem("selectedAlgorithm", this.algorithmSelector.value)
            this.updateGraphCategories()
        }
        let storedAlgorithm = window.localStorage.getItem("selectedAlgorithm")
        if (storedAlgorithm) {
            this.algorithmSelector.value = storedAlgorithm
        }
    }

    setupRunAlgorithm() {
        let runAlgorithmButton = document.getElementById("run_algorithm")

        runAlgorithmButton.onclick = async () => {
            import('../Algorithm/Control/AlgorithmController.js').then(async ({default: AlgorithmController}) => {
                let algorithmController = new AlgorithmController(this.graphView);
                let algorithm = await this.getAlgorithmFromName(this.algorithmSelector.value);
                if (!algorithm) return;
                await algorithmController.setup(algorithm);
            })
        }
    }

    setupCategories() {
        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            let storedState = window.localStorage.getItem(category)
            checkbox.checked = storedState === "true"
            if (category === GraphCategory.COLORED_NODES && storedState == null) {
                checkbox.checked = true
            }
        }

        //Opções de formato de grafo
        this.categoryCheckboxes[GraphCategory.COLORED_NODES].addEventListener('change', this.updateGraphCategories)
        this.categoryCheckboxes[GraphCategory.WEIGHTED_EDGES].addEventListener('change', this.updateGraphCategories)
        this.categoryCheckboxes[GraphCategory.DIRECTED_EDGES].addEventListener('change', this.updateGraphCategories)
    }

    setupLabeling() {
        // Seletor de label de nó
        this.nodeLabelingSelector = document.getElementById("nodeLabeling")
        this.nodeLabelingSelector.onchange = function(e) {
            this.graphView.nodeLabeling = e.target.value;
            this.graphView.refreshGraph();
        }
    }

    // endregion

    // region Helpers

    // Repositório de categorias obrigatórias e proibidas por algoritmo
    getRequiredCategoriesForAlgorithm = (alg) => {
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

    // Retorna o algoritmo importado pelo seu nome de exibição
    getAlgorithmFromName = async (name) => {
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
            let algModule = await import(`../Algorithm/${algModuleName}.js`);
            return algModule.default;
        }
        return null;
    }

    // Atualiza o grafo após alterações nas categorias
    updateGraphCategories = () => {
        let enabledCategories = []
        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            window.localStorage.setItem(category, checkbox.checked)
            if (checkbox.checked) { enabledCategories.push(category) }
        }
        this.graphView.updateGraphConstructors(enabledCategories)
    }


    refreshInterfaceCategories = () => {
        let categoriesState = this.graphView.structure.getCategories();
        for (let [category, checkbox] of Object.entries(this.categoryCheckboxes)) {
            checkbox.checked = categoriesState.has(category);
        }
    }

    // endregion
}
