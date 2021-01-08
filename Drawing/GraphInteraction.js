import { Tool } from "./General.js"

/* Tolerância para iniciar a seleção múltipla */
const movementTolerance = 20

const graphMouseHandler = (graphView) => ({
    /* Registra caso um nó tenha sido movimentado, útil no mouse up */
    movedNode: false,

    /* Registra a ultima posição em que o mousedown ocorreu para
       fazer a seleção múltipla */
    lastMousedownPosition: null,
    /* Registra caso haja uma seleção múltipla acontecendo */
    multipleSelection: false,
    /* Registra nós selecionados na última seleção múltipla */
    multipleSelectedNodes: [],
    
    selectionPoint: null,

    mouseDownEvent(mouseEvent) {
        // Somente o botão esquerdo nos interessa
        if (mouseEvent.button != 0) return;
        
        graphView.movedNode = false;

        // Seleciona o nó clicado
        let pos = graphView.getMousePos(mouseEvent);
        graphView.selectedNode = graphView.getNodeIndexAt(pos)[0];
        graphView.currentMousePos = pos
        graphView.refreshCursorStyle();

        // console.log(!g.selectedNode)
        if (!graphView.selectedNode) {
            // Reseta nós selecionados
            graphView.multipleSelectedNodes = []
            graphView.updateMultipleSelectedNodes()
            // Registrando posição do mouseDown
            graphView.lastMousedownPosition = pos
        } else {
            graphView.selectionPoint = pos
            // console.log("abcde")
        }
    },

    mouseDragEvent(mouseEvent) {
        let pos = graphView.getMousePos(mouseEvent);
        graphView.currentMousePos = pos
        // g.selectionPrototyping(pos.x, pos.y)
        let hovering = graphView.getNodeIndexAt(pos)[0] != null;
        // console.log(graphView.lastMousedownPosition)

        // Se nada estiver selecionado, pare por aqui
        if (graphView.selectedNode == null) {
            if (graphView.lastMousedownPosition != null) {
                let currentPos = graphView.currentMousePos
                let lastPos = graphView.lastMousedownPosition
                let hMove = Math.abs(currentPos.x - lastPos.x)
                let vMove = Math.abs(currentPos.y - lastPos.y)

                if (hMove > movementTolerance || vMove > movementTolerance) {
                    graphView.multipleSelection = true
                    graphView.setSelectionRectangle(lastPos, currentPos)
                } else if(graphView.multipleSelection) {
                    graphView.setSelectionRectangle(lastPos, currentPos)
                }
            }
            else {
                // console.trace()
                // console.warn("Last mouse down null")
            }
            graphView.refreshCursorStyle()
            return;
        }
        
        // Caso o usuário esteja movendo o nó, altere o ponteiro
        // adaptCursorStyle(g, hovering);
        // Caso a ferramenta Move esteja selecionada
        if (graphView.primaryTool == Tool.MOVE) {
            // Se não há nós na seleção múltipla, mova o único clicado
            // se houver 1 na seleção múltipla, mova o mesmo.
            if (graphView.multipleSelectedNodes.length <= 1) {
                // Mova o nó para o ponteiro do mouse
                graphView.moveNode(graphView.selectedNode, pos);

            // Se há mais de 1 nó na seleção múltipla
            } else {
                for (let nodeIndex in graphView.multipleSelectedNodes) {
                    // Mova cada nó para a posição nova,
                    // que é relativa a sua posição inicial
                    let posBeforeMove = graphView.selectedOriginalPos[nodeIndex]
                    let newPosition = {
                        x: posBeforeMove.x + pos.x - graphView.selectionPoint.x,
                        y: posBeforeMove.y + pos.y - graphView.selectionPoint.y
                    }
                    graphView.moveNode(graphView.multipleSelectedNodes[nodeIndex], newPosition);
                }
            }

            // Registre que um nó se moveu
            graphView.movedNode = true;

        // Caso a ferramenta Connect esteja selecionada
        } else if (graphView.primaryTool == Tool.CONNECT) {
            // Registre a nova posição do mouse no grafo
            // para que a aresta temporária seja desenhada corretamente.
            graphView.pointerPos = pos;
        }
    },

    mouseUpEvent(mouseEvent) {
        let pos = graphView.getMousePos(mouseEvent);
        // Se o botão direito foi o levantado
        if (mouseEvent.button == 2) {
            // Tente remover um nó, se o mouse estiver sobre algum
            graphView.removeNodeAt(pos);
            return;
        }
        // adaptCursorStyle(g, false);

        /* Selecionando nodes na área de seleção múltipla */
        if (graphView.multipleSelection) {
            graphView.multipleSelectedNodes = graphView.getNodesWithin(graphView.lastMousedownPosition, pos)
            graphView.selectedOriginalPos = Array.from(graphView.multipleSelectedNodes.map(node => node.pos))
            graphView.updateMultipleSelectedNodes()
            graphView.multipleSelection = false
            graphView.lastMousedownPosition = null
            graphView.setSelectionRectangle(graphView.lastMousedownPosition, pos)

            return
        } else {
            graphView.lastMousedownPosition = null
        }

        // Se o botão esquerdo foi o levantado,
        switch (graphView.primaryTool) {
            // A ferramenta MOVE for a escolhida,
            case Tool.MOVE:
                graphView.selectedOriginalPos = Array.from(graphView.multipleSelectedNodes.map(node => node.pos))
                // E nenhum nó tenha sido movido no gesto atual
                if (graphView.movedNode == false) {
                    // Insira um nó novo
                    graphView.insertNewNodeAt(pos);
                }
                break;

            // A ferramenta CONNECT for a escolhida
            case Tool.CONNECT:
                // Um nó estiver selecionado
                if (graphView.selectedNode != null) {
                    // E um nó está abaixo do ponteiro do mouse atualmente
                    let releasedOverNode = graphView.getNodeIndexAt(pos)[0];
                    if (releasedOverNode != null) {
                        // Insira uma aresta conectando ambos
                        // g.structure.insertEdge(g.selectedNode, releasedOverNode, new Edge())
                        graphView.insertEdgeBetween(graphView.selectedNode, releasedOverNode)
                    }
                    // Pare de atualizar a aresta temporária
                    graphView.pointerPos = null;

                // Se nenhum nó estiver selecionado
                } else {
                    // Insira um nó novo
                    graphView.insertNewNodeAt(pos);
                }
                break;
        }
        // Remova a seleção do nó
        graphView.selectedNode = null;
        graphView.refreshCursorStyle()
    }
})

export default graphMouseHandler