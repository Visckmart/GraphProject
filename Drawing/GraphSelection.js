import { Tool } from "./General.js";
import { Node } from "../Structure/Node.js";
import Edge from "../Structure/Edge.js";

/* Tolerância para iniciar a seleção múltipla */
const movementTolerance = 20

export default class GraphSelection {

    constructor(graphView) {
        this.graphView = graphView;
    }

    selected = {
        nodes: [],
        edges: []
    }

    /**
     * O modo additionOnly faz com que a inversão de seleção só adicione,
     * caso a situação resultasse na remoção de uma seleção ela não acontece.
     */
    _additionOnlyMode = false;
    get additionOnlyMode() {
        return this.shouldDrawSelection || this._additionOnlyMode;
    }
    set additionOnlyMode(newState) {
        this._additionOnlyMode = newState;
    }

    invertSelection(element) {
        if (element instanceof Node) { // Caso seja um nó
            let nodeIndex = this.selected.nodes.indexOf(element);
            if (nodeIndex >= 0 && this.shouldDrawSelection == false) {
                this.selected.nodes.splice(nodeIndex, 1);
            } else {
                this.selected.nodes.push(element);
                this.isQuickSelection = false;
            }

        } else if (element instanceof Edge) { // Caso seja uma aresta
            let edgeIndex = this.selected.nodes.indexOf(element);
            if (edgeIndex >= 0 && this.shouldDrawSelection == false) {
                this.selected.edges.splice(edgeIndex, 1);
            } else {
                this.selected.edges.push(element);
            }

        } else { // Se não é nem um nó, nem uma aresta, algo de errado aconteceu
            console.warn(`Inversão de seleção chamada para ${element}.`);
            console.trace();
            return;
        }
        this.graphView.selectionChanged();
        this.refreshMenu();
    }

    //region Add and Remove Selection Methods
    select(element) {
        if (element instanceof Node) { // Caso seja um nó
            let nodeIndex = this.selected.nodes.indexOf(element);
            if (nodeIndex == -1) {
                this.selected.nodes.push(nodeIndex, 1);
            }
        } else if (element instanceof Edge) { // Caso seja uma aresta
            let edgeIndex = this.selected.nodes.indexOf(element);
            if (edgeIndex == -1) {
                this.selected.edges.push(edgeIndex, 1);
            }
        } else { // Se não é nem um nó, nem uma aresta, algo de errado aconteceu
            console.error(`Remoção de seleção chamada para ${element}.`);
        }
    }

    selectMultiple(elements) {
        this.selected.nodes = elements.filter(e => e instanceof Node);
        this.selected.edges = elements.filter(e => e instanceof Edge);
        this.registerNodePositions();
        this.graphView.selectionChanged();
    }

    deselect(element) {
        if (element instanceof Node) { // Caso seja um nó
            let nodeIndex = this.selected.nodes.indexOf(element);
            if (nodeIndex >= 0) {
                this.selected.nodes.splice(nodeIndex, 1);
            }
        } else if (element instanceof Edge) { // Caso seja uma aresta
            let edgeIndex = this.selected.edges.indexOf(element);
            if (edgeIndex >= 0) {
                this.selected.edges.splice(edgeIndex, 1);
            }
        } else { // Se não é nem um nó, nem uma aresta, algo de errado aconteceu
            console.error(`Remoção de seleção chamada para ${element}.`);
        }
    }

    isQuickSelection = false;

    quickSelect(node) {
        this.clear();
        this.selected.nodes = [node];
        this.registerNodePositions();
        this.isQuickSelection = true;
        this.graphView.selectionChanged();
        this.refreshMenu();
    }

    clear() {
        this.selected.nodes = [];
        this.selected.edges = [];
        this.isQuickSelection = false;
        this.graphView.selectionChanged();
        this.refreshMenu();
    }
    //endregion

    /**
     * Armazenamento das posições para possibilitar que múltiplos nós sejam
     * movidos ao mesmo tempo.
     */
    selectedNodePositions = [];

    registerNodePositions() {
        this.selectedNodePositions = Array.from(
            this.selected.nodes.map(node => node.pos)
        );
    }

    //region Checando seleção

    isSelected(element) {
        if (element instanceof Node) { // Caso seja um nó
            return this.selected.nodes.indexOf(element) >= 0;

        } else if (element instanceof Edge) { // Caso seja uma aresta
            return this.selected.edges.indexOf(element) >= 0;

        } else { // Se não é nem um nó, nem uma aresta, algo de errado aconteceu
            console.error(`Checagem de seleção chamada para ${element}.`);
            return false;
        }
    }

    get hasSelectedNodes() {
        return this.selected.nodes.length > 0;
    }

    get hasSelectedEdges() {
        return this.selected.edges.length > 0;
    }

    get selectionIsEmpty() {
        return this.selected.nodes.length == 0 && this.selected.edges.length == 0;
    }
    //endregion



    //region Área de Seleção

    selectionArea = {
        startPoint: null,
        endPoint: null
    }

    get shouldDrawSelection() {
        return this.selectionArea.startPoint != null
               && this.selectionArea.endPoint != null;
    }

    checkSelectionGesture(startingPoint, currentPoint) {
        if (startingPoint == null || currentPoint == null) {
            return false;
        }
        let horizontalMove = Math.abs(currentPoint.x - startingPoint.x);
        let verticalMove   = Math.abs(currentPoint.y - startingPoint.y);

        return (horizontalMove > movementTolerance || verticalMove > movementTolerance);
    }

    draggingEvent(startPoint, endPoint) {
        if (startPoint == null || endPoint == null) {
            console.log("No selection area.");
            this.clearSelectionArea();
            return;
        }
        let validGesture = this.checkSelectionGesture(startPoint, endPoint);
        if (validGesture == false) {
            this.clearSelectionArea();
            return;
        }
        this.selectionArea.startPoint = startPoint;
        this.selectionArea.endPoint = endPoint;
        this.updateContainedElements();
    }

    prepareSelectionAreaDrawing(context) {
        let startPoint = this.selectionArea.startPoint;
        let endPoint = this.selectionArea.endPoint;
        let width = endPoint.x - startPoint.x;
        let height = endPoint.y - startPoint.y;

        context.beginPath();
        context.rect(startPoint.x, startPoint.y, width, height);
    }

    updateContainedElements() {
        let startPoint = this.selectionArea.startPoint;
        let endPoint = this.selectionArea.endPoint;

        switch (this.graphView.primaryTool) {
        // A ferramenta MOVE for a escolhida,
        case Tool.MOVE: {
            let containedNodes = this.graphView.getNodesWithin(startPoint, endPoint);
            // console.log(containedNodes, this._additionOnlyMode)
            if (this._additionOnlyMode) {
                this.selected.nodes = this.selected.nodes.concat(...containedNodes);
            } else {
                this.selected.nodes = containedNodes;
            }
            break;
        }
        case Tool.CONNECT: {
            this.selected.edges = this.graphView.getEdgesWithin(startPoint, endPoint);
            break;
        }
        }

        this.graphView.selectionChanged();
    }

    clearSelectionArea() {
        this.selectionArea.startPoint = null;
        this.selectionArea.endPoint   = null;
    }

    //endregion



    refreshMenu() {
        // Escondendo todas as configurações
        let settingsList = ["GraphSettings", "NodeSettings", "EdgeSettings"]
                            .map(id => document.getElementById(id))
        for (let settings of settingsList) {
            settings.style.display = "none";
        }

        let showSettings;
        // Configurações de Nó
        if (this.selected.nodes.length == 1
            && this.isQuickSelection == false
            && this.shouldDrawSelection == false) {

            showSettings = document.getElementById("NodeSettings");
            let selectedNode = this.selected.nodes[0]
            let element = document.getElementById('NodeProperties');
            // TODO: Pegar algoritmo correto
            element.updateProperties(selectedNode, 'Dijkstra');

        // Configurações de Aresta
        } else if (this.selected.edges.length == 1
                   && this.shouldDrawSelection == false) {
            showSettings = document.getElementById("EdgeSettings");

            let selectedEdge = this.selected.edges[0];
            let element = document.getElementById('EdgeProperties');
            element.updateProperties(selectedEdge, 'Dijkstra');
        // Configurações de Grafo
        } else {
            showSettings = document.getElementById("GraphSettings")
        }

        showSettings.style.display = "block";

    }
}