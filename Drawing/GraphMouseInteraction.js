import { Tool } from "./General.js"
let graphView = null;
class GraphMouseHandler {
    
    constructor(graphView) {
        // this.canvas = auxInfo.canvas;
        // this.selection = auxInfo.selectionHandler;
        // this.getNodeIndexAt = auxInfo.getNodeIndexAt;
        // this.structure = auxInfo.structure;
        // this.graphView = auxInfo.graphView;
        // console.log(graphView)
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
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
            if (this.selectedNode == null) {
                cursorStyle = "grab"
            } else {
                cursorStyle = "grabbing"
            }
        }
        if (this.selection.drawingSelection == true) {
            cursorStyle = "crosshair"
        }
        // Atualize o estilo apropriadamente
        this.graphView.canvas.style.cursor = cursorStyle;
    }

    /* Registra a ultima posição em que o mousedown ocorreu para
       fazer a seleção múltipla */
    clickPosition = null;
    
    justClearedSelection = false;
    mouseDownEvent(mouseEvent) {
        // Somente o botão esquerdo nos interessa
        if (mouseEvent.button != 0) return;
        // console.log(this)

        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos
        this.refreshCursorStyle();

        // Registrando posição do mouseDown
        this.clickPosition = pos
        this.justClearedSelection = false;
        // Checa se o mouse está em cima de um nó
        let clickedNode = this.graphView.getNodeIndexAt(pos)[0]
        // Caso um nó tenha sido clicado,
        if (clickedNode) {
            // E ele NÃO está selecionado,
            if (this.selection.selectedNodes.includes(clickedNode) == false) {
                // Limpe a seleção
                this.selection.clear()
                // E coloque o nó temporariamente
                // (Para não mostrar pontilhado e mover imediatamente)
                this.selection.selectNodeTemporarily(clickedNode)
            }

        // Caso contrário (nenhum nó clicado)
        } else {
            if (this.selection.hasSelectedNodes) {
                this.justClearedSelection = true;
            }
            // Limpe a seleção
            this.selection.clear()
        }
    }

    mouseDragEvent(mouseEvent) {
        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos

        // Se não for um clique do botão esquerdo, ignoramos
        if (mouseEvent.buttons == 0 || mouseEvent.button != 0) {
            this.refreshCursorStyle()
            return;
        }

        // SELEÇÃO
        // Se nada estiver selecionado,
        if (this.selection.selectedNodes.length == 0) {
            // E uma área estiver sendo desenhada
            if (this.selection.drawingSelection) {
                // Atualize a área
                this.selection.setSelectionArea(pos)

            // Caso contrário, se uma área deve começar a ser desenhada
            } else if (this.selection.checkSelectionGesture(this.clickPosition, pos)) {
                // Começamos a desenhá-la
                this.selection.startSelection(pos)
            }
            this.refreshCursorStyle()
            return;
        }

        // MOVER
        // Caso a ferramenta Move esteja selecionada,
        if (this.graphView.primaryTool == Tool.MOVE) {
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

        // Caso a ferramenta Connect esteja selecionada
        } else if (this.graphView.primaryTool == Tool.CONNECT) {
            // Registre a nova posição do mouse no grafo
            // para que a aresta temporária seja desenhada corretamente.
            // graphView.pointerPos = pos;
            this.shouldDrawTemporaryEdge = true;
        }
    }

    mouseUpEvent(mouseEvent) {
        let pos = this.getMousePos(mouseEvent);
        // Se o botão direito foi o levantado
        if (mouseEvent.button == 2) {
            // Tente remover um nó, se o mouse estiver sobre algum
            this.graphView.removeNodeAt(pos);
            return;
        }

        // SELEÇÃO
        /* Se fez uma área de seleção, selecione os nós contidos */
        if (this.selection.drawingSelection) {
            this.selection.drawingSelection = false
            this.selection.selectedNodes = this.graphView.getNodesWithin(this.clickPosition, pos)
            // this.clickPosition = null
            return
        }
       
        // Se o botão esquerdo foi o levantado,
        switch (this.graphView.primaryTool) {
            // A ferramenta MOVE for a escolhida,
            case Tool.MOVE:
                /* Se soltou um único nó que estava sendo movido, limpe a seleção */
                if (this.selection.temporarySelection) {
                    if (this.currentMousePos == this.clickPosition) {
                        this.selection.temporarySelection = false;
                        // this.selection.updateNodesAppearance()
                    } else {
                        this.selection.clear()
                    }
                    return;
                }
                if (this.selection.hasSelectedNodes) {
                    // Atualiza a posição dos nós selecionados, para que o próximo
                    // gesto de mover esses nós tenha as posições adequadas.
                    this.selection.updateOriginalPositions()
                } else {
                    if (!this.justClearedSelection) {
                        // Insira um nó novo
                        this.graphView.insertNewNodeAt(pos);
                    }
                }
                break;

            // A ferramenta CONNECT for a escolhida
            case Tool.CONNECT:
                let initialNode;

                // Se um nó estiver selecionado,
                if (this.selection.hasSelectedNodes) {
                    // O inicial é o selecionado
                    initialNode = this.graphView.getNodeIndexAt(this.clickPosition)[0];
                } else {
                    // console.error("Nunca acontece porque a seleção interrompe a ação.")
                    // initialNode = this.graphView.insertNewNodeAt(this.clickPosition)
                    break;
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
        // Remova a seleção do nó
        this.refreshCursorStyle()
    }
}

export default GraphMouseHandler