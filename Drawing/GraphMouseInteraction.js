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

import { CanvasType, Tool } from "./General.js"
import { HighlightType } from "../Utilities/Highlights.js"
import { getDistanceOf, isLeftClick, isRightClick, isTouchEnvironment } from "../Utilities/Utilities.js"
import Edge from "../Structure/Edge.js";

class GraphMouseHandler {
    
    constructor(graphView) {
        this.graphView = graphView;
        this.selection = graphView.selectionHandler;
        this._enabled = true;
        this.canvasRect = this.graphView.canvas.getBoundingClientRect();
    }

    debugRawEvents = false;
    debugEvents = false;

    getMousePos(mouseEvent) {
        let rawX = mouseEvent.clientX;
        let rawY = mouseEvent.clientY;
        if (isTouchEnvironment()) {
            rawX = mouseEvent.changedTouches[0].clientX;
            rawY = mouseEvent.changedTouches[0].clientY;
        }
        return {
            x: rawX - this.canvasRect.left,
            y: rawY - this.canvasRect.top
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
        // if (this.graphView.primaryTool == Tool.CONNECT) {
            this.clickedEdge = this.graphView.getEdgesAt(pos).pop();
        // }
    }

    willClick(pos) {
        if (this.debugEvents) { console.log("willClick", pos) }
        this.clickPosition = pos;
        this.moved = false;
    }

    // Preparação para o clique com o botão esquerdo
    willLeftClick(pos) {
        if (this.debugEvents) { console.log("willLeftClick", pos) }

        if (this.clickedNode) {
            if (Tool.MOVE == this.graphView.primaryTool) {
                let containsNode = this.selection.selected.nodes.includes(this.clickedNode);
                if (this.selection.additionOnlyMode == false && containsNode == false) {
                    this.selection.clear();
                }
                if (this.selection.isEmpty) {
                    this.selection.quickSelect(this.clickedNode);
                }
            }
        } else if (this.clickedEdge) {
            if (Tool.CONNECT == this.graphView.primaryTool) {
                let containsEdge = this.selection.selected.edges.includes(this.clickedEdge);
                if (this.selection.additionOnlyMode == false && containsEdge == false) {
                    this.selection.clear();
                }
                if (this.selection.isEmpty) {
                    this.selection.quickSelect(this.graphView.structure.getEdgeNodes(this.clickedEdge));
                }
            }
        }
    }

    // nodeListPos = [];
    // Finalizado um clique com o botão esquerdo, sem arrastar
    didLeftClick(pos) {
        if (this.debugEvents) { console.log("didLeftClick", pos) }
        this.clickPosition = pos;

        if (this.clickedNode) {
            if (Tool.MOVE == this.graphView.primaryTool) {
                if (this.selection.additionOnlyMode) {
                    this.selection.invertSelection(this.clickedNode);
                } else {
                    this.selection.clear()
                    this.selection.select(this.clickedNode);
                }
            }
        } else if (this.clickedEdge) {
            if (Tool.MOVE == this.graphView.primaryTool) {
                let [nodeA, nodeB] = this.graphView.structure.getEdgeNodes(this.clickedEdge)
                let newDividerNode = this.graphView.insertNewNodeAt(pos);
                if (newDividerNode) {
                    this.graphView.removeEdgeAt(pos);
                    this.graphView.insertEdgeBetween(nodeA, newDividerNode);
                    this.graphView.insertEdgeBetween(newDividerNode, nodeB);
                }
            } else if (Tool.CONNECT == this.graphView.primaryTool) {
                if (this.selection.additionOnlyMode) {
                    this.selection.invertSelection(this.clickedEdge)
                } else {
                    this.selection.clear()
                    this.selection.select(this.clickedEdge);
                    // this.nodeListPos = [];
                    // this.nodeList = [];
                    // for (let edge of this.selection.selected.edges) {
                    //     let [a, b] = this.graphView.structure.getEdgeNodes(edge);
                    //     this.nodeList.push(a);
                    //     this.nodeListPos.push(a.pos);
                    //     this.nodeList.push(b);
                    //     this.nodeListPos.push(b.pos);
                    // }
                }
            }
        } else {
            if (this.selection.additionOnlyMode == false) {
                if (this.selection.isEmpty) {
                    this.graphView.insertNewNodeAt(pos);
                } else {
                    this.selection.clear()
                }
            }
        }
        this.selection.registerNodePositions();
    }

    didRightClick(pos) {
        if (this.debugEvents) { console.log("didRightClick", pos) }

        if (this.clickedNode) {
            if (Tool.MOVE == this.graphView.primaryTool) {
                this.graphView.removeNodeAt(pos);
            }
        } else if (this.clickedEdge) {
            if (Tool.CONNECT == this.graphView.primaryTool) {
                this.graphView.removeEdgeAt(pos);
            }
        }
    }
    // nodeList = [];
    // Um movimento está sendo feito com o botão esquerdo apertado
    isMovingLeftClick(pos) {
        if (this.debugEvents) { console.log("isMovingLeftClick", pos) }

        this.moved = true;
        // console.log("move", getDistanceOf(this.clickPosition, pos));
        if (this.clickedNode) {
            if (Tool.MOVE == this.graphView.primaryTool) {
                if (this.selection.isQuickSelection) {
                    this.graphView.moveNode(this.clickedNode, pos);
                } else if (this.selection.selected.nodes.includes(this.clickedNode)) {
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
                    this.graphView.requestCanvasRefresh(CanvasType.GENERAL)
                }
            } else if (Tool.CONNECT == this.graphView.primaryTool) {
                this.shouldDrawTemporaryEdge = true;
                    this.graphView.requestCanvasRefresh(CanvasType.FAST);
                    // this.graphView.refreshFastCanvas();
            }
        } else if (this.clickedEdge) {
            // console.log("Aresta");
            if (this.selection.isQuickSelection) {
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
                this.graphView.requestCanvasRefresh(CanvasType.GENERAL);
            } else {
                console.error("Interação não implementada.");
                // this.selectedNodePositions = Array.from(
                //     this.selection.selected.nodes.map(node => node.pos)
                // );

                // let nodeList = [];
                // for (let edge of this.selection.selected.edges) {
                //     let [a, b] = this.graphView.structure.getEdgeNodes(edge);
                //     nodeList.push(a);
                //     nodeList.push(b);
                // }
                // console.log(this.nodeListPos.length);
                // console.log(this.nodeList.length);
                // for (let nodeIndex in this.nodeList) {
                //     // Calcula cada nova posição levando em conta as posições
                //     // originais de cada nó.
                //     let posBeforeMove = this.nodeListPos[nodeIndex];
                //     let newPosition = {
                //         x: posBeforeMove.x + pos.x - this.clickPosition.x,
                //         y: posBeforeMove.y + pos.y - this.clickPosition.y
                //     }
                //     // console.log(nodeList[nodeIndex]);
                //     this.graphView.moveNode(this.nodeList[nodeIndex],
                //                             newPosition);
                // }
                // this.graphView.requestCanvasRefresh(CanvasType.GENERAL);
            }
        } else {
            // if (Tool.MOVE == this.graphView.primaryTool) {
                // console.log("move");
                if (this.selection.additionOnlyMode == false) {
                    this.selection.clear();
                }
                this.selection.draggingEvent(this.clickPosition, pos);
            // }
        }
    }

    didMoveLeftClick(pos) {
        if (this.debugEvents) { console.log("didMoveLeftClick", pos) }

        // Se está desenhando a área de seleção
        if (this.selection.shouldDrawSelection) {
            // Para de desenhar
            this.selection.clearSelectionArea();
            this.selection.refreshMenu()
        }
        this.selection.registerNodePositions();
        if (this.clickedNode) {
            if (Tool.CONNECT == this.graphView.primaryTool) {
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
            }
        }
        if (this.selection.isQuickSelection) {
            this.selection.clear();
        }
    }

    // Mouse DOWN event
    // justClearedSelection = false;
    currentMousePos = null;
    mouseDownEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if (!this._enabled) { return; }
        if (this.debugRawEvents) { console.log("mouse down") }

        // Atualizando posição do mouse
        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        this.refreshCursorStyle();

        if (isLeftClick(mouseEvent)) {
            this.willClick(pos);
            this.willLeftClick(pos);
        } else if (isRightClick(mouseEvent)) {
            this.willClick(pos);
        }
        this.refreshCursorStyle();
        // // Se o botão esquerdo foi o apertado
        // if (isLeftClick(mouseEvent)) {
        //     // Registrando posição do mouseDown
        //     this.clickPosition = pos;
        //     this.justClearedSelection = false;
        //
        //     // Se puder selecionar
        //     if (this.canSelectItems()) {
        //         if (this.selection.additionOnlyMode == false) {
        //             this.selection.clear();
        //         }
        //         this.selection.quickSelect(this.clickedNode);
        //     }
        // }
        // // Se o botão direito foi o apertado
        // else if (isRightClick(mouseEvent)) {
        //     // Se puder remover
        //     if (this.canDeleteItems()) {
        //         if (this.graphView.primaryTool == Tool.MOVE) {
        //             // Tente remover um nó, se o mouse estiver sobre algum
        //             this.graphView.removeNodeAt(pos);
        //         } else if (this.graphView.primaryTool == Tool.CONNECT) {
        //             // Tente remover uma arestas, se o mouse estiver sobre alguma
        //             this.graphView.removeEdgeAt(pos);
        //         }
        //     }
        // }
        // if (this.selection.isEmpty == false) {
        //     this.justClearedSelection = true;
        // }
        // this.refreshCursorStyle();
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
    mouseMoveEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }
        if (this.debugRawEvents) { console.log("mouse move") }
        let pos = this.getMousePos(mouseEvent);
        this.currentMousePos = pos;
        this.handleEdgeHover(pos);

        // if (this.clickedNode) {
        //     let d = getDistanceOf(this.clickPosition, pos)
        //     if (this.moved == false) {
        //         console.log(d)
        //     }
        // }
        // TODO: Organizar
        let a = false;
        if (this.clickPosition) {
            let d = getDistanceOf(this.clickPosition, pos);
            a = ((this.clickedNode || this.clickedEdge) && d >= 3) || (!this.clickedNode && !this.clickedEdge && d >= 10);
        }
        if (mouseEvent.buttons != 0 && isLeftClick(mouseEvent) && a) {
            this.isMovingLeftClick(pos);
        }
        this.refreshCursorStyle();
        // console.log(mouseEvent);
        // console.log(mouseEvent.buttons == 0, mouseEvent.buttons == 2, mouseEvent.button != 0);
        // if (!isLeftClick(mouseEvent)) {
        //     this.refreshCursorStyle();
        //     return;
        // }
        // /* SOMENTE COM MOUSE ESQUERDO CLICADO */
        //
        // // SELEÇÃO
        // if (!this.clickedNode && !this.clickedEdge) {
        //     // Atualize a área de seleção
        //     this.selection.draggingEvent(this.clickPosition, pos);
        //     this.refreshCursorStyle();
        //     return;
        // }
        //
        // // MOVER
        // // Caso a ferramenta Move esteja selecionada,
        // switch (this.graphView.primaryTool) {
        // case Tool.MOVE: {
        //     if (this.selection.selected.nodes.includes(this.clickedNode)) {
        //         for (let nodeIndex in this.selection.selected.nodes) {
        //             // Calcula cada nova posição levando em conta as posições
        //             // originais de cada nó.
        //             let posBeforeMove = this.selection.selectedNodePositions[nodeIndex];
        //             let newPosition = {
        //                 x: posBeforeMove.x + pos.x - this.clickPosition.x,
        //                 y: posBeforeMove.y + pos.y - this.clickPosition.y
        //             }
        //             this.graphView.moveNode(this.selection.selected.nodes[nodeIndex],
        //                                     newPosition);
        //         }
        //         this.graphView.requestCanvasRefresh(CanvasType.GENERAL)
        //     }
        //     break;
        // }
        //
        // // Caso a ferramenta Connect esteja selecionada
        // case Tool.CONNECT: {
        //     this.shouldDrawTemporaryEdge = true;
        //     this.graphView.requestCanvasRefresh(CanvasType.FAST)
        //     break;
        // }
        // }
    }

    // Mouse UP event
    mouseUpEvent = (mouseEvent) => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }
        // console.log(mouseEvent);
        let pos = this.getMousePos(mouseEvent);
        // console.log(mouseEvent);
        if (this.debugRawEvents) { console.log("mouse up") }
        if (isLeftClick(mouseEvent)) {
            if (this.moved) {
                this.didMoveLeftClick(pos);
            } else {
                this.didLeftClick(pos);
            }
        } else if (isRightClick(mouseEvent)) {
            this.didRightClick(pos);
        }
        this.refreshCursorStyle();
        this.clickedNode = null;
        this.graphView.requestCanvasRefresh(CanvasType.SLOW);
        // if (isRightClick(mouseEvent)
        //     && this.selection.shouldDrawSelection == false) {
        //     return;
        // }
        // // SELEÇÃO
        // let distanceFromClick = getDistanceOf(this.clickPosition, pos);
        // if (this.clickPosition && distanceFromClick < 5) {
        //     if (this.selection.additionOnlyMode == false && this.selection.isQuickSelection == false) {
        //         this.selection.clear();
        //     }
        //
        //     if (this.clickedNode) {
        //         if (Tool.MOVE == this.graphView.primaryTool) {
        //             this.selection.invertSelection(this.clickedNode);
        //         }
        //     } else if (this.clickedEdge && Tool.CONNECT == this.graphView.primaryTool) {
        //         this.selection.invertSelection(this.clickedEdge);
        //         this.handleEdgeHover(pos);
        //     }
        // } else {
        //     if (this.selection.isQuickSelection) {
        //         this.selection.clear();
        //     }
        // }
        //
        // // Atualiza a posição dos nós selecionados, para que o próximo
        // // gesto de mover esses nós tenha as posições adequadas.
        // this.selection.registerNodePositions();
        // if (distanceFromClick > 5) {
        //     this.graphView.registerStep();
        // }
        //
        // // Se o botão esquerdo foi o levantado,
        // switch (this.graphView.primaryTool) {
        // // A ferramenta MOVE for a escolhida,
        // case Tool.MOVE: {
        //     // Caso não tenha acabado de limpar uma seleção
        //      if (this.selection.shouldDrawSelection == false
        //          && this.justClearedSelection == false) {
        //         // Insira um nó novo
        //         this.graphView.insertNewNodeAt(pos);
        //     }
        //     break;
        // }
        //
        // // A ferramenta CONNECT for a escolhida
        // case Tool.CONNECT: {
        //     // Se o clique não foi feito em um nó, então pare.
        //     if (this.clickedNode == null) { break; }
        //
        //     // Nó abaixo do ponteiro do mouse atualmente
        //     let releasedOverNode = this.graphView.getNodesAt(pos, true).pop()
        //                         ?? this.graphView.insertNewNodeAt(pos);
        //     if (releasedOverNode) {
        //         let insertedEdge = this.graphView.insertEdgeBetween(this.clickedNode,
        //                                                             releasedOverNode);
        //         if (insertedEdge && insertedEdge.constructor != Edge) {
        //             this.selection.clear();
        //             this.selection.select(insertedEdge)
        //         }
        //     }
        //     // Pare de atualizar a aresta temporária
        //     this.shouldDrawTemporaryEdge = false;
        //     this.graphView.refreshFastCanvas();
        //     break;
        // }
        // }
        //
        // // Se está desenhando a área de seleção
        // if (this.selection.shouldDrawSelection) {
        //     // Para de desenhar
        //     this.selection.clearSelectionArea();
        //     this.selection.refreshMenu()
        // }
        // this.clickedNode = null;
        // this.graphView.requestCanvasRefresh(CanvasType.SLOW);
        // this.refreshCursorStyle()
    }


    mouseLeaveEvent = () => {
        // Eventos de mouse desabilitados
        if(!this._enabled) { return; }
        if (this.debugRawEvents) { console.log("mouse leave event") }

        // Se está desenhando a área de seleção
        if (this.selection.shouldDrawSelection) {
            // Para de desenhar
            this.selection.clearSelectionArea();
            this.selection.refreshMenu()
        }
        // // Pare de atualizar a aresta temporária
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