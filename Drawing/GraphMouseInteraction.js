import { Tool } from "./General.js"
import { HighlightType } from "../Structure/Highlights.js"

class GraphMouseHandler {
    
    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
        this._enabled = true
    }

    /* Registra a ultima posição em que o mousedown ocorreu para
       fazer a seleção múltipla */
    _clickPosition = null;
    get clickPosition() {
        return this._clickPosition;
    }
    set clickPosition(pos) {
        this._clickPosition = pos;
        this.clickedNode = this.graphView.getNodeIndexAt(this.clickPosition).pop()
        this.clickedEdge = this.graphView.checkEdgeCollision(pos)
    }
    clickedNode = null;
    clickedEdge = null;
    justClearedSelection = false;
    mouseDownEvent(mouseEvent) {
        // Eventos de mouse desabilitados
        if(!this._enabled)
        {
            return
        }

        // Somente o botão esquerdo nos interessa
        // if (mouseEvent.button != 0) return;
        // console.log(this)
        // console.info("Mouse down event")

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos
        this.refreshCursorStyle();

        // Registrando posição do mouseDown
        this.clickPosition = pos
        this.justClearedSelection = false;
        
        // console.log(this.clickedEdge)
        // console.log(this.graphView.primaryTool, this.clickedNode, this.clickedEdge)

        if (this.selection.selected.nodes.length > 0 || this.selection.selected.edges.length > 0) {
            this.justClearedSelection = true;
        }
        // // Caso um nó tenha sido clicado,
        // if (this.clickedNode && mouseEvent.button == 0) {
        //     // console.log("Mouse down on node")
        //     // E ele NÃO está selecionado,
        //     if (this.selection.selectedNodes.includes(this.clickedNode) == false) {
        //         // Limpe a seleção
        //         this.selection.clear()
        //         if (this.graphView.primaryTool == Tool.MOVE) {
        //             // E coloque o nó temporariamente
        //             // (Para não mostrar pontilhado e mover imediatamente)
        //             this.selection.selectNodeTemporarily(this.clickedNode)
        //         }
        //     }
        // } else if (this.clickedEdge) {
        //     if (this.selection.selectedEdges.includes(this.clickedEdge) == false) {
        //         this.selection.clear()
        //         if (this.graphView.primaryTool != Tool.MOVE) {
        //             this.selection.selectedEdges.push(this.clickedEdge)
        //             this.selection.selectedEdges = this.selection.selectedEdges
        //             this.selection.updateEdgesAppearance()
        //         }
        //     }
        // } else {
        //     // console.log("Mouse down on background")
        // }
        this.refreshCursorStyle()
    }

    edgeColision = null
    mouseDragEvent(mouseEvent) {
        // Eventos de mouse desabilitados
        if(!this._enabled)
        {
            return
        }

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        // console.log(this.selection.temporarySelection)
        let nodeHover = this.graphView.getNodeIndexAt(pos)
        if (this.edgeColision) {
            this.edgeColision.highlights.remove(HighlightType.LIGHTEN)
        }
        if (this.graphView.primaryTool == Tool.CONNECT) {
            if (nodeHover.length == 0) {
                let edgeHover = this.graphView.checkEdgeCollision(pos)
                this.edgeColision = edgeHover
                if (edgeHover) {
                    edgeHover.highlights.add(HighlightType.LIGHTEN)
                }
            }
        }

        if (mouseEvent.buttons == 0 || mouseEvent.button != 0 || mouseEvent.buttons == 2) {
            this.refreshCursorStyle();
            return;
        }
        // SOMENTE COM MOUSE ESQUERDO CLICADO

        // SELEÇÃO
        // Se um nó não tiver sido selecionado,
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
            // Se há uma seleção temporária,
            if (false /*this.selection.temporarySelection*/) {
                console.assert(
                    this.selection.selectedNodes.length == 1,
                    "Seleção temporária deveria conter só 1 nó."
                )
                // Considere a posição inicial para que o centro do nó
                // não pule para o mouse
                let originalNodePos = this.selection.selectedNodePositions[0]
                pos.x += originalNodePos.x - this.clickPosition.x
                pos.y += originalNodePos.y - this.clickPosition.y
                // Mova o nó
                this.graphView.moveNode(this.selection.selected.nodes[0], pos);

            // Caso contrário,
            } else {
                // Mova todos os nós selecionados
                for (let nodeIndex in this.selection.selected.nodes) {
                    // console.log(nodeIndex, this.selection.selected.nodes[nodeIndex])
                    // Calcula cada nova posição levando em conta as posições
                    // originais de cada nó.
                    let posBeforeMove = this.selection.selectedNodePositions[nodeIndex]
                    let newPosition = {
                        x: posBeforeMove.x + pos.x - this.clickPosition.x,
                        y: posBeforeMove.y + pos.y - this.clickPosition.y
                    }
                    this.graphView.moveNode(this.selection.selected.nodes[nodeIndex], newPosition);
                }
            }
            break;
        }

        // Caso a ferramenta Connect esteja selecionada
        case Tool.CONNECT: {
            // Registre a nova posição do mouse no grafo
            // para que a aresta temporária seja desenhada corretamente.
            // graphView.pointerPos = pos;
            this.shouldDrawTemporaryEdge = true;
            break;
        }
        }
    }

    mouseUpEvent(mouseEvent) {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }

        let pos = this.getMousePos(mouseEvent);

        // Se o botão direito foi o levantado
        if (mouseEvent.button == 2 && this.selection.shouldDrawSelection == false) {
            // Tente remover um nó, se o mouse estiver sobre algum
            this.graphView.removeNodeAt(pos);
            return;
        }

        // SELEÇÃO
        let didntMove = this.clickPosition.x == pos.x
                        && this.clickPosition.y == pos.y;
        if (didntMove) {
            if (this.selection.shouldDrawSelection == false) {
                this.selection.clear();
            }

            if ((this.clickedNode && Tool.MOVE == this.graphView.primaryTool)
                || (this.clickedEdge && Tool.CONNECT == this.graphView.primaryTool)) {
                this.selection.invertSelection(this.clickedNode);
            }
        }

        // Atualiza a posição dos nós selecionados, para que o próximo
        // gesto de mover esses nós tenha as posições adequadas.
        this.selection.registerNodePositions();

        // let wasDrawingSelection = this.selection.shouldDrawSelection;
        // Se o botão esquerdo foi o levantado,
        switch (this.graphView.primaryTool) {
        // A ferramenta MOVE for a escolhida,
        case Tool.MOVE: {
             if (this.selection.shouldDrawSelection == false) { // Senão
                // Caso não tenha acabado de limpar uma seleção
                if (this.justClearedSelection == false) {
                    // Insira um nó novo
                    this.graphView.insertNewNodeAt(pos);
                }
            }
            break;
        }

        // A ferramenta CONNECT for a escolhida
        case Tool.CONNECT: {
            // Se o clique não foi feito em um nó, então pare.
            if (this.clickedNode == null) {
                break;
            }

            // Nó abaixo do ponteiro do mouse atualmente
            let releasedOverNode = this.graphView.getNodeIndexAt(pos).pop()
                                ?? this.graphView.insertNewNodeAt(pos);

            this.graphView.insertEdgeBetween(this.clickedNode, releasedOverNode);
            // Pare de atualizar a aresta temporária
            this.shouldDrawTemporaryEdge = false;
            break;
        }
        }
        // Se está desenhando a área de seleção
        if (this.selection.shouldDrawSelection) {
            // Para de desenhar
            this.selection.clearSelectionArea();
        }
        this.refreshCursorStyle()
    }


    getMousePos(mouseEvent) {

        var canvasRect = this.graphView.canvas.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - canvasRect.left,
            y: mouseEvent.clientY - canvasRect.top
        };
    }

    refreshCursorStyle() {
        // Eventos de mouse desabilitados
        if(!this._enabled)
        {
            return
        }

        // Restaura o ponteiro para o visual padrão
        let cursorStyle = null;
        // Se não sabemos a posição (acontece antes do primeiro movimento)
        if (this.currentMousePos == null) { return; }

        let isHoveringNode = this.graphView.getNodeIndexAt(this.currentMousePos).length > 0;
        // Checa se a ferramenta MOVE está selecionada
        let moveToolSelected = this.graphView.primaryTool == Tool.MOVE;
        
        // Se a ferramenta MOVE for selecionada E o mouse estiver sobre um nó
        if (moveToolSelected && isHoveringNode) {
            if (this.selection.hasSelectedNodes && this.clickPosition == this.currentMousePos) {
                cursorStyle = "grabbing"
            } else {
                cursorStyle = "grab"
            }
        }
        if (this.selection.drawingSelection == true) {
            cursorStyle = "crosshair"
        }
        // Atualize o estilo apropriadamente
        this.graphView.canvas.style.cursor = cursorStyle;
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