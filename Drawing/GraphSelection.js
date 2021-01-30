import { NodeHighlightType } from "../Structure/Node.js"
import {Tool} from "./General.js";

/* Tolerância para iniciar a seleção múltipla */
const movementTolerance = 20

export default class GraphSelection {
    constructor(canvas, structure, graphView) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.graphView = graphView;
    }

    /* Registra caso haja uma seleção múltipla acontecendo */
    drawingSelection = false;
    
    selectionArea = {
        startPoint: null,
        endPoint: null
    }

    checkSelectionGesture(startingPoint, currentPoint) {
        if (startingPoint == null || currentPoint == null) {
            return false;
        }
        let horizontalMove = Math.abs(currentPoint.x - startingPoint.x)
        let verticalMove   = Math.abs(currentPoint.y - startingPoint.y)

        return (horizontalMove > movementTolerance || verticalMove > movementTolerance)
    }

    startSelection(pos) {
        this.selectionArea.startPoint = pos;
        this.drawingSelection = true;
    }

    setSelectionArea(startPoint, endPoint) {
        if (startPoint == null || endPoint == null) {
            console.log("No selection area.")
            this.drawingSelection = false;
            return;
        }
        if (this.checkSelectionGesture(startPoint, endPoint) == false) {
            return;
        }
        this.selectionArea.startPoint = startPoint;
        this.selectionArea.endPoint = endPoint;
        this.drawingSelection = true;
        this.updateSelectedElements()
    }

    clearSelectionArea() {
        this.selectionArea.startPoint = null;
        this.selectionArea.endPoint = null;
        this.drawingSelection = false;
    }


    /* Registra nós selecionados na última seleção múltipla */
    _selectedNodes = [];
    get selectedNodes() {
        return this._selectedNodes
    }
    set selectedNodes(selectedNodes) {
        let d = document.getElementById("dynamic")
        if (selectedNodes.length > 0) {
            d.innerHTML = selectedNodes.length + " nós selecionados"
        } else {
            d.innerHTML = "Nenhum nó selecionado."
        }

        this._selectedNodes = selectedNodes
        this.updateOriginalPositions()
        if (this.selectedNodes.length == 0) {
            this.temporarySelection = false;
        }
        this.updateNodesAppearance()
        this.graphView.refreshMenu(this.selectedNodes.length, this.selectedEdges.length)
    }
    /* Registra nós selecionados na última seleção múltipla */
    _selectedEdges = [];
    get selectedEdges() {
        return this._selectedEdges
    }
    set selectedEdges(selectedEdges) {
        this._selectedEdges = selectedEdges

        this.updateEdgesAppearance()
        this.graphView.refreshMenu(this.selectedNodes.length, this.selectedEdges.length)
    }
    // selectedEdges = new Set()

    updateSelectedElements() {
        if (this.drawingSelection) {
            // Se o botão esquerdo foi o levantado,
            switch (this.graphView.primaryTool) {
                // A ferramenta MOVE for a escolhida,
                case Tool.MOVE: {
                    this.selectedNodes = this.graphView.getNodesWithin(this.selectionArea.startPoint, this.selectionArea.endPoint)
                    break;
                }
                case Tool.CONNECT: {
                    this.selectedEdges = this.graphView.getEdgesWithin(this.selectionArea.startPoint, this.selectionArea.endPoint)
                    break;
                }
            }
        }
    }

    removeSelectionFrom(node) {
        let currentSelectedNodes = this.selectedNodes;
        let indexOfNode = currentSelectedNodes.indexOf(node)
        currentSelectedNodes.splice(indexOfNode, 1)
        this.selectedNodes = currentSelectedNodes;
    }

    clear() {
        this.selectedNodes = [];
        this.selectedEdges = [];
    }

    get hasSelectedNodes() {
        return this.selectedNodes.length > 0;
    }

    
    _temporarySelection = false;
    get temporarySelection() {
        return this._temporarySelection;
    }
    set temporarySelection(temp) {
        this._temporarySelection = temp;
        this.updateNodesAppearance()
        this.graphView.refreshMenu(this.selectedNodes.length, this.selectedEdges.length)
    }

    selectNodeTemporarily(node) {
        this.temporarySelection = true
        this.selectedNodes = [node]
        // this.graphView.refreshMenu(this.selectedNodes.length, this.temporarySelection)
    }

    
    updateOriginalPositions() {
        this.selectedOriginalPos = Array.from(this.selectedNodes.map(node => node.pos))
    }

    /* Destaca os nós selecionados */
    updateNodesAppearance() {
        for (let node of this.graphView.structure.nodes()) {
            if (this.selectedNodes.includes(node) && this.temporarySelection == false) {
                node.addHighlight(NodeHighlightType.SELECTION)
            } else {
                node.removeHighlight(NodeHighlightType.SELECTION)
            }
        }
    }

    updateEdgesAppearance() {
        for (let [edge, a, b] of this.graphView.structure.edges()) {
            if (this.selectedEdges.includes(edge)) {
                edge.addHighlight(NodeHighlightType.SELECTION)
            } else {
                edge.removeHighlight(NodeHighlightType.SELECTION)
            }
        }
    }


    drawSelectionArea() {
        let startPoint = this.selectionArea.startPoint;
        let endPoint = this.selectionArea.endPoint;
        let width = endPoint.x - startPoint.x;
        let height = endPoint.y - startPoint.y;

        this.ctx.save()

        this.ctx.strokeStyle = 'blue'
        this.ctx.fillStyle = 'rgba(0,0,255,0.1)'
        this.ctx.lineWidth = 3
        
        this.ctx.fillRect  (startPoint.x, startPoint.y, width, height)
        this.ctx.strokeRect(startPoint.x, startPoint.y, width, height)

        this.ctx.restore()
    }

}