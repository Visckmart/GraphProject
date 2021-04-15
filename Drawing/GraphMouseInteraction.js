import {CanvasType, Tool} from "./General.js"
import { HighlightType } from "../Utilities/Highlights.js"
import { getDistanceOf, isLeftClick, isRightClick } from "../Utilities/Utilities.js"
import Edge from "../Structure/Edge.js";

class GraphMouseHandler {
    
    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
        this._enabled = true;
        this.canvasRect = this.graphView.canvas.getBoundingClientRect();
    }

    getMousePos(mouseEvent) {
        return {
            x: mouseEvent.clientX - this.canvasRect.left,
            y: mouseEvent.clientY - this.canvasRect.top
        };
    }

    /* Registra a ultima posição em que o mousedown ocorreu para
       fazer a seleção múltipla */
    _clickPosition = null;
    clickedNode = null;
    clickedEdge = null;
    get clickPosition() {
        return this._clickPosition;
    }
    set clickPosition(pos) {
        this._clickPosition = pos;
        this.clickedNode = this.graphView.getNodesAt(this.clickPosition).pop();
        if (this.graphView.primaryTool == Tool.CONNECT) {
            this.clickedEdge = this.graphView.getEdgesAt(pos).pop();
        }
    }

    // Mouse DOWN event
    justClearedSelection = false;
    currentMousePos = null;
    mouseDownEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if (!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        this.refreshCursorStyle();

        // Registrando posição do mouseDown
        this.clickPosition = pos;
        this.justClearedSelection = false;

        // console.log(this.clickedEdge)
        // console.log(this.graphView.primaryTool, this.clickedNode, this.clickedEdge)

        // Se o botão direito foi o levantado
        if (isRightClick(mouseEvent) && !this.selection.shouldDrawSelection) {
            if (this.graphView.primaryTool == Tool.MOVE) {
                // Tente remover um nó, se o mouse estiver sobre algum
                this.graphView.removeNodeAt(pos);
            } else if (this.graphView.primaryTool == Tool.CONNECT) {
                // Tente remover uma arestas, se o mouse estiver sobre alguma
                this.graphView.removeEdgeAt(pos);
            }
        }
        if (isLeftClick(mouseEvent) && this.clickedNode != null
            && this.selection.isSelected(this.clickedNode) == false) {
            if (this.selection.additionOnlyMode == false) {
                this.selection.clear();
            }
            this.selection.quickSelect(this.clickedNode);
        }
        if (this.selection.isEmpty == false) {
            this.justClearedSelection = true;
        }
        this.refreshCursorStyle();
    }

    lastHoveredEdge = null;
    handleEdgeHover(pos) {
        this.lastHoveredEdge?.highlights.remove(HighlightType.LIGHTEN);
        if (this.graphView.primaryTool != Tool.CONNECT) { return; }

        // NODE COLISION
        if (this.graphView.checkIfNodeAt(this.currentMousePos)) { return; }

        let edgeHover = this.graphView.getEdgesAt(pos).pop();
        if (edgeHover && !this.selection.isSelected(edgeHover)) {
            edgeHover.highlights.add(HighlightType.LIGHTEN);
        }
        this.lastHoveredEdge = edgeHover;
    }

    // Mouse DRAG event
    mouseDragEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        this.handleEdgeHover(pos);

        if (mouseEvent.buttons == 0
            || mouseEvent.buttons == 2
            || mouseEvent.button != 0) {
            this.refreshCursorStyle();
            return;
        }
        /* SOMENTE COM MOUSE ESQUERDO CLICADO */

        // SELEÇÃO
        if (!this.clickedNode && !this.clickedEdge) {
            // Atualize a área de seleção
            this.selection.draggingEvent(this.clickPosition, pos);
            this.refreshCursorStyle();
            return;
        }

        // MOVER
        // Caso a ferramenta Move esteja selecionada,
        switch (this.graphView.primaryTool) {
        case Tool.MOVE: {
            if (this.selection.selected.nodes.includes(this.clickedNode)) {
                for (let nodeIndex in this.selection.selected.nodes) {
                    // Calcula cada nova posição levando em conta as posições
                    // originais de cada nó.
                    let posBeforeMove = this.selection.selectedNodePositions[nodeIndex];
                    let newPosition = {
                        x: posBeforeMove.x + pos.x - this.clickPosition.x,
                        y: posBeforeMove.y + pos.y - this.clickPosition.y
                    }
                    this.graphView.moveNode(this.selection.selected.nodes[nodeIndex],
                                            newPosition);
                }
            }
            break;
        }

        // Caso a ferramenta Connect esteja selecionada
        case Tool.CONNECT: {
            this.shouldDrawTemporaryEdge = true;
            this.graphView.requestCanvasRefresh(CanvasType.FAST)
            break;
        }
        }
    }

    // Mouse UP event
    mouseUpEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);

        if (isRightClick(mouseEvent)
            && this.selection.shouldDrawSelection == false) {
            return;
        }
        // SELEÇÃO
        let distanceFromClick = getDistanceOf(this.clickPosition, pos);
        if (this.clickPosition && distanceFromClick < 5) {
            if (this.selection.additionOnlyMode == false && this.selection.isQuickSelection == false) {
                this.selection.clear();
            }

            if (this.clickedNode) {
                if (Tool.MOVE == this.graphView.primaryTool) {
                    this.selection.invertSelection(this.clickedNode);
                }
            } else if (this.clickedEdge && Tool.CONNECT == this.graphView.primaryTool) {
                this.selection.invertSelection(this.clickedEdge);
                this.handleEdgeHover(pos);
            }
        } else {
            if (this.selection.isQuickSelection) {
                this.selection.clear();
            }
        }

        // Atualiza a posição dos nós selecionados, para que o próximo
        // gesto de mover esses nós tenha as posições adequadas.
        this.selection.registerNodePositions();
        if (distanceFromClick > 5) {
            this.graphView.registerStep();
        }

        // Se o botão esquerdo foi o levantado,
        switch (this.graphView.primaryTool) {
        // A ferramenta MOVE for a escolhida,
        case Tool.MOVE: {
            // Caso não tenha acabado de limpar uma seleção
             if (this.selection.shouldDrawSelection == false
                 && this.justClearedSelection == false) {
                // Insira um nó novo
                this.graphView.insertNewNodeAt(pos);
            }
            break;
        }

        // A ferramenta CONNECT for a escolhida
        case Tool.CONNECT: {
            // Se o clique não foi feito em um nó, então pare.
            if (this.clickedNode == null) { break; }

            // Nó abaixo do ponteiro do mouse atualmente
            let releasedOverNode = this.graphView.getNodesAt(pos, true).pop()
                                ?? this.graphView.insertNewNodeAt(pos);
            if (releasedOverNode) {
                let insertedEdge = this.graphView.insertEdgeBetween(this.clickedNode,
                                                                    releasedOverNode);
                if (insertedEdge && insertedEdge.constructor != Edge) {
                    this.selection.clear();
                    this.selection.select(insertedEdge)
                }
            }
            // Pare de atualizar a aresta temporária
            this.shouldDrawTemporaryEdge = false;
            this.graphView.refreshFastCanvas();
            break;
        }
        }

        // Se está desenhando a área de seleção
        if (this.selection.shouldDrawSelection) {
            // Para de desenhar
            this.selection.clearSelectionArea();
            this.selection.refreshMenu()
        }
        this.clickedNode = null;
        this.graphView.requestCanvasRefresh(CanvasType.SLOW);
        this.refreshCursorStyle()
    }


    mouseLeaveEvent = () => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }
        // Se está desenhando a área de seleção
        if (this.selection.shouldDrawSelection) {
            // Para de desenhar
            this.selection.clearSelectionArea();
            this.selection.refreshMenu()
        }
        // Pare de atualizar a aresta temporária
        this.shouldDrawTemporaryEdge = false;

        // Atualiza a posição dos nós selecionados, para que o próximo
        // gesto de mover esses nós tenha as posições adequadas.
        // this.selection.registerNodePositions();
    }

    // Estilo do ponteiro do mouse
    refreshCursorStyle() {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        // Restaura o ponteiro para o visual padrão
        let cursorStyle = "";
        // Se não sabemos a posição (acontece antes do primeiro movimento)
        if (this.currentMousePos == null) { return; }

        // Caso tenha uma área de seleção sendo desenhada
        if (this.selection.shouldDrawSelection == true) {
            cursorStyle = "crosshair";
        } else {
            grabCheck:if (this.graphView.primaryTool == Tool.MOVE) {
                let isHoveringNode = this.graphView.getNodesAt(this.currentMousePos);
                if (isHoveringNode.length == 0) { break grabCheck; }
                if (this.selection.hasSelectedNodes && isHoveringNode.includes(this.clickedNode)) {
                    cursorStyle = "grabbing";
                } else {
                    cursorStyle = "grab";
                }
            }
        }

        // Atualize o estilo apropriadamente
        if (this.graphView.canvas.style.cursor != cursorStyle) {
            this.graphView.canvas.style.cursor = cursorStyle;
        }
    }

    enable() {
        this._enabled = true
    }

    disable() {
        this._enabled = false
        this.graphView.canvas.style.cursor = "default"
    }
}

export default GraphMouseHandler