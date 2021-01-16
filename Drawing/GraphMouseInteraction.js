import { Tool } from "./General.js"

class GraphMouseHandler {
    
    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
    }

    /* Registra a ultima posição em que o mousedown ocorreu para
       fazer a seleção múltipla */
    _clickPosition = null;
    get clickPosition() {
        return this._clickPosition;
    }
    set clickPosition(pos) {
        this._clickPosition = pos;
        this.clickedNode = this.graphView.getNodeIndexAt(this.clickPosition)[0]
    }
    clickedNode = false;
    justClearedSelection = false;
    to = null;
    mostRecentNode = null;
    mouseDownEvent(mouseEvent) {
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
        
        // Caso um nó tenha sido clicado,
        if (this.clickedNode) {
            // console.log("Mouse down on node")
            // E ele NÃO está selecionado,
            if (this.selection.selectedNodes.includes(this.clickedNode) == false) {
                // Limpe a seleção
                this.selection.clear()
                if (this.graphView.primaryTool == Tool.MOVE) {
                    // E coloque o nó temporariamente
                    // (Para não mostrar pontilhado e mover imediatamente)
                    this.selection.selectNodeTemporarily(this.clickedNode)
                }
            }
        } else {
            // console.log("Mouse down on background")
            if (this.selection.hasSelectedNodes) {
                this.justClearedSelection = true;
            }
            this.selection.clear()
        }
        this.refreshCursorStyle()
    }

    mouseDragEvent(mouseEvent) {
        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        // console.log(this.selection.temporarySelection)

        // Se não for um clique do botão esquerdo, ignoramos
        if (mouseEvent.buttons == 0 || mouseEvent.button != 0 || mouseEvent.buttons == 2) {
            this.refreshCursorStyle();
            return;
        }

        // SELEÇÃO
        // Se um nó não tiver sido selecionado,
        if (this.clickedNode == null && this.mostRecentNode == null) {
            // Atualize a área de seleção
            this.selection.setSelectionArea(this.clickPosition, pos);
            this.refreshCursorStyle()
            return;
        }

        // MOVER
        // Caso a ferramenta Move esteja selecionada,
        switch (this.graphView.primaryTool) {
            case Tool.MOVE: {
                // Se há uma seleção temporária,
                if (this.selection.temporarySelection) {
                    console.assert(
                        this.selection.selectedNodes.length == 1,
                        "Seleção temporária deveria conter só 1 nó."
                    )
                    // Mova o nó para o ponteiro do mouse
                    this.graphView.moveNode(this.selection.selectedNodes[0], pos);

                // Caso contrário,
                } else {
                    // Mova todos os nós selecionados
                    for (let nodeIndex in this.selection.selectedNodes) {
                        // Calcula cada nova posição levando em conta as posições
                        // originais de cada nó.
                        let posBeforeMove = this.selection.selectedOriginalPos[nodeIndex]
                        let newPosition = {
                            x: posBeforeMove.x + pos.x - this.clickPosition.x,
                            y: posBeforeMove.y + pos.y - this.clickPosition.y
                        }
                        this.graphView.moveNode(this.selection.selectedNodes[nodeIndex], newPosition);
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
        let pos = this.getMousePos(mouseEvent);
        console.log()
        // Se o botão direito foi o levantado
        if (mouseEvent.button == 2) {
            this.selection.clearSelectionArea()
            // Tente remover um nó, se o mouse estiver sobre algum
            this.graphView.removeNodeAt(pos);
            return;
        }
        // console.info("Mouse up event")
        // SELEÇÃO
        /* Se fez uma área de seleção, finalize-a */
        if (this.selection.drawingSelection) {
            this.selection.drawingSelection = false
            this.graphView.refreshMenu(this.selection.selectedNodes.length)
            return
        }
       
        // Se o botão esquerdo foi o levantado,
        switch (this.graphView.primaryTool) {
            // A ferramenta MOVE for a escolhida,
            case Tool.MOVE: {
                // console.log("...with MOVE tool")
                /* Se soltou um único nó que estava sendo movido, limpe a seleção */
                if (this.selection.temporarySelection) {
                    // console.log("...with temporary selection")
                    if (this.currentMousePos == this.clickPosition) {
                        // console.log("...without move")
                        this.selection.temporarySelection = false;
                        // this.selection.updateNodesAppearance()
                    } else {
                        // console.log("...with move")
                        this.selection.clear()
                    }
                    this.refreshCursorStyle()
                    return;
                }
                // console.log("...without temporary selection")
                if (this.selection.hasSelectedNodes) {
                    // console.log("...with selected nodes")
                    // Atualiza a posição dos nós selecionados, para que o próximo
                    // gesto de mover esses nós tenha as posições adequadas.
                    this.selection.updateOriginalPositions()
                } else {
                    // console.log("...without selected nodes")
                    if (!this.justClearedSelection) {
                        // Insira um nó novo
                        this.graphView.insertNewNodeAt(pos);
                    }
                }
                break;
            }

            // A ferramenta CONNECT for a escolhida
            case Tool.CONNECT: {
                let initialNode = this.graphView.getNodeIndexAt(this.clickPosition)[0];

                // Se um nó estiver selecionado,
                if (initialNode == null) {
                    return;
                }

                // Nó abaixo do ponteiro do mouse atualmente
                let releasedOverNode = this.graphView.getNodeIndexAt(pos)[0];
                if (releasedOverNode == null) {
                    releasedOverNode = this.graphView.insertNewNodeAt(pos)
                }
                this.graphView.insertEdgeBetween(initialNode, releasedOverNode)
                // Pare de atualizar a aresta temporária
                this.shouldDrawTemporaryEdge = false;
                break;
            }
        }
        // Remova a seleção do nó
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
}

export default GraphMouseHandler