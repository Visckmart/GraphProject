import { Tool } from "./General.js";
import { Node } from "../Structure/Node.js";
import Edge from "../Structure/Edge.js";

/* Tolerância para iniciar a seleção múltipla */
const movementTolerance = 20

export default class GraphSelection {

    constructor(graphView) {
        this.graphView = graphView;
    }

    get additionOnlyMode() {
        return this.shouldDrawSelection;
    }

    selected = {
        nodes: [],
        edges: []
    }

    invertSelection(element) {
        if (element instanceof Node) { // Caso seja um nó
            let nodeIndex = this.selected.nodes.indexOf(element);
            if (nodeIndex >= 0 && this.additionOnlyMode == false) {
                this.selected.nodes.splice(nodeIndex, 1);
            } else {
                this.selected.nodes.push(element);
            }
        } else if (element instanceof Edge) { // Caso seja uma aresta
            let edgeIndex = this.selected.nodes.indexOf(element);
            if (edgeIndex >= 0 && this.additionOnlyMode == false) {
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

    deselect(element) {
        if (element instanceof Node) { // Caso seja um nó
            let nodeIndex = this.selected.nodes.indexOf(element);
            if (nodeIndex >= 0) {
                this.selected.nodes.splice(nodeIndex, 1);
            }
        } else if (element instanceof Edge) { // Caso seja uma aresta
            let edgeIndex = this.selected.nodes.indexOf(element);
            if (edgeIndex >= 0) {
                this.selected.edges.splice(edgeIndex, 1);
            }
        } else { // Se não é nem um nó, nem uma aresta, algo de errado aconteceu
            console.error(`Remoção de seleção chamada para ${element}.`);
        }
    }
    //endregion

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

    clear() {
        this.selected.nodes = [];
        this.selected.edges = [];
        this.isQuickSelection = false;
        this.graphView.selectionChanged();
        this.refreshMenu();
    }



    // SELECTION AREA

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
            this.selected.nodes = this.graphView.getNodesWithin(startPoint, endPoint);
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

    isQuickSelection = false;

    quickSelect(node) {
        this.clear();
        this.selected.nodes = [node];
        this.registerNodePositions();
        this.isQuickSelection = true;
        this.graphView.selectionChanged();
        this.refreshMenu();
    }

    get quicklySelectedNode() {
        return this.selected.nodes[0];
    }



    // TODO: Organizar
    refreshMenu() {
        let numberOfSelectedNodes = this.selected.nodes.length
        let numberOfSelectedEdges = this.selected.edges.length
        let settingsList = ["GraphSettings", "NodeSettings", "EdgeSettings"]
        for (let settingsID of settingsList) {
            let s = document.getElementById(settingsID)
            s.style.display = "none"
        }
        let showSettings;
        if (numberOfSelectedNodes == 1 && this.isQuickSelection == false
            && this.shouldDrawSelection == false) {
            showSettings = document.getElementById("NodeSettings")
            /*
            // console.log("b")
            let selectionHandler = this.selectionHandler

            let labelInput = document.getElementById("label")
            labelInput.value = this.selectionHandler.selectedNodes[0].label
            labelInput.oninput = function(input) {
                selectionHandler.selectedNodes[0].label = input.target.value
            }
            setTimeout(function () { labelInput.focus(); labelInput.select() }, 0);

            let colorInput = document.getElementById("color")
            colorInput.value = this.selectionHandler.selectedNodes[0].color
            colorInput.oninput = function(input) {
                selectionHandler.selectedNodes[0]._originalcolor = input.target.value
            } */
            let selectedNode = this.selected.nodes[0]
            let element = document.getElementById('NodeProperties')
            // TODO: Pegar algoritmo correto
            element.updateProperties(selectedNode, 'Dijkstra')
        } else if (numberOfSelectedEdges == 1 && this.shouldDrawSelection == false) {
            // console.log("a")
            showSettings = document.getElementById("EdgeSettings")

            let selectedEdge = this.selected.edges[0]
            let element = document.getElementById('EdgeProperties')
            element.updateProperties(selectedEdge, 'Dijkstra')
        } else {
            showSettings = document.getElementById("GraphSettings")
        }
        showSettings.style.display = "block"

    }
}