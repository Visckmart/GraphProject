import { Tool } from "./General.js"
import { HighlightType } from "../Structure/Highlights.js"
import { getDistanceOf } from "../Structure/Utilities.js"
import Edge from "../Structure/Edge.js";

class GraphMouseHandler {
    
    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
        this._enabled = true
    }

    getMousePos(mouseEvent) {
        let canvasRect = this.graphView.canvas.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - canvasRect.left,
            y: mouseEvent.clientY - canvasRect.top
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
        this.clickedEdge = this.graphView.getEdgesAt(pos);
    }

    // Mouse DOWN event
    justClearedSelection = false;
    mouseDownEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        this.refreshCursorStyle();

        // Registrando posição do mouseDown
        this.clickPosition = pos;
        this.justClearedSelection = false;
        
        // console.log(this.clickedEdge)
        // console.log(this.graphView.primaryTool, this.clickedNode, this.clickedEdge)


        if (this.clickedNode) {
            let clickedNotSelected = !this.selection.isSelected(this.clickedNode);
            if (this.selection.isEmpty && clickedNotSelected) {
                this.selection.quickSelect(this.clickedNode);
            }
        }
        if (this.selection.isEmpty == false) {
            this.justClearedSelection = true;
        }
        this.refreshCursorStyle();
    }

    // Mouse DRAG event
    lastHoveredEdge = null;
    mouseDragEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;

        // TODO: Organizar destaque de arestas
        this.lastHoveredEdge?.highlights.remove(HighlightType.LIGHTEN);
        if (this.graphView.primaryTool == Tool.CONNECT) {
            // NODE COLISION
            let isHoveringNode = this.graphView.getNodesAt(this.currentMousePos).length > 0;
            if (this.graphView.primaryTool == Tool.CONNECT && isHoveringNode == false) {
                let edgeHover = this.graphView.getEdgesAt(pos)
                this.lastHoveredEdge = edgeHover
                if (edgeHover && !this.selection.isSelected(edgeHover)) {
                    edgeHover.highlights.add(HighlightType.LIGHTEN)
                }
            }
        }

        if (mouseEvent.buttons == 0|| mouseEvent.buttons == 2
            || mouseEvent.button != 0) {
            this.refreshCursorStyle();
            return;
        }
        // SOMENTE COM MOUSE ESQUERDO CLICADO

        // SELEÇÃO
        // Se um nó não tiver sido selecionado,
        if (!this.clickedNode && !this.clickedEdge) {
            let selecting = this.selection.shouldDrawSelection
            // Atualize a área de seleção
            this.selection.draggingEvent(this.clickPosition, pos);
            if (selecting != this.selection.shouldDrawSelection) {
                requestAnimationFrame(this.graphView.refreshOverlay.bind(this.graphView))
            }
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
            } else {
                this.selection.quickSelect(this.clickedNode)
            }
            break;
        }

        // Caso a ferramenta Connect esteja selecionada
        case Tool.CONNECT: {
            this.shouldDrawTemporaryEdge = true;
            break;
        }
        }
    }

    // Mouse UP event
    mouseUpEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);

        // Se o botão direito foi o levantado
        if (mouseEvent.button == 2
            && this.selection.shouldDrawSelection == false) {
            // Tente remover um nó, se o mouse estiver sobre algum
            this.graphView.removeNodeAt(pos);
            // Tente remover uma arestas, se o mouse estiver sobre alguma
            this.graphView.removeEdgeAt(pos);
            return;
        }

        // SELEÇÃO
        if (this.clickPosition && getDistanceOf(this.clickPosition, pos) < 5) {
            if (this.selection.additionOnlyMode == false) {
                this.selection.clear();
            }

            if (this.clickedNode) {
                if (Tool.MOVE == this.graphView.primaryTool) {
                    this.selection.invertSelection(this.clickedNode);
                }
            } else if (this.clickedEdge && Tool.CONNECT == this.graphView.primaryTool) {
                this.selection.invertSelection(this.clickedEdge);
            }
        } else {
            if (this.selection.isQuickSelection) {
                this.selection.clear();
            }
        }

        // Atualiza a posição dos nós selecionados, para que o próximo
        // gesto de mover esses nós tenha as posições adequadas.
        this.selection.registerNodePositions();

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
            let releasedOverNode = this.graphView.getNodesAt(pos).pop()
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
            break;
        }
        }

        // Se está desenhando a área de seleção
        if (this.selection.shouldDrawSelection) {
            // Para de desenhar
            this.selection.clearSelectionArea();
            this.selection.refreshMenu()
        }
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
        this.selection.registerNodePositions();
    }
    // Estilo do ponteiro do mouse
    refreshCursorStyle() {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        // Restaura o ponteiro para o visual padrão
        let cursorStyle = null;
        // Se não sabemos a posição (acontece antes do primeiro movimento)
        if (this.currentMousePos == null) { return; }

        let isHoveringNode = this.graphView.getNodesAt(this.currentMousePos).length > 0;
        // Checa se a ferramenta MOVE está selecionada
        let moveToolSelected = this.graphView.primaryTool == Tool.MOVE;
        
        // Se a ferramenta MOVE for selecionada E o mouse estiver sobre um nó
        if (moveToolSelected && isHoveringNode) {
            if (this.selection.hasSelectedNodes && this.clickPosition && getDistanceOf(this.clickPosition, this.currentMousePos) < 5) {
                cursorStyle = "grabbing";
            } else {
                cursorStyle = "grab";
            }
        }
        if (this.selection.shouldDrawSelection == true) {
            cursorStyle = "crosshair";
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