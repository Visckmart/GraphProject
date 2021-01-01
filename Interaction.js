import { canvas, Tool } from "./General.js"
import { g } from "./GraphView.js"

const moveButton = document.getElementById("movebtn");
const connectButton = document.getElementById("connectbtn");

moveButton.onclick = moveTool;
connectButton.onclick = connectTool;

canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("contextmenu", contextMenuOpened);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mousemove", mouseMoved);


// Mouse Handling

let currentMousePos = null;
function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function adaptCursorStyle(graph, isHoveringNode) {
    // Restaura o ponteiro para o visual padrão
    let cursorStyle = null;
    if (isHoveringNode == null) {
        if (currentMousePos == null) {
            return;
        } else {
            isHoveringNode = graph.getNodeIndexAt(currentMousePos)[0] != null;
        }
    }
    // Checa se a ferramenta MOVE está selecionada
    let moveToolSelected = graph.primaryTool == Tool.MOVE;
    
    // Se a ferramenta MOVE for selecionada E o mouse estiver sobre um nó
    if (moveToolSelected && isHoveringNode != false) {
        if (g.selectedNode == null) {
            cursorStyle = "grab"
        } else {
            cursorStyle = "grabbing"
        }
    }
    // Atualize o estilo apropriadamente
    canvas.style.cursor = cursorStyle;
}

/* Registra caso um nó tenha sido movimentado, útil no mouse up */
let movedNode = false;

/* MOUSE DOWN */
function mouseDown(e) {
    // Somente o botão esquerdo nos interessa
    if (e.button != 0) return;

    // Seleciona o nó clicado
    let pos = getMousePos(e);
    g.selectedNode = g.getNodeIndexAt(pos)[0];
    movedNode = false;
    adaptCursorStyle(g, g.selectedNode != null);
}

/* MOUSE MOVED */

function mouseMoved(e) {
    let pos = getMousePos(e);
    currentMousePos = pos;
    let hovering = g.getNodeIndexAt(pos)[0] != null;

    // Se nada estiver selecionado, pare por aqui
    if (g.selectedNode == null) {
        adaptCursorStyle(g, hovering);
        return;
    }
    
    // Caso o usuário esteja movendo o nó, altere o ponteiro
    adaptCursorStyle(g, hovering);

    // Caso a ferramenta Move esteja selecionada
    if (g.primaryTool == Tool.MOVE) {
        // Mova o nó para o ponteiro do mouse
        g.moveNode(g.selectedNode, pos);
        // Registre que um nó se moveu
        movedNode = true;

    // Caso a ferramenta Connect esteja selecionada
    } else if (g.primaryTool == Tool.CONNECT) {
        // Registre a nova posição do mouse no grafo
        // para que a aresta temporária seja desenhada corretamente.
        g.pointerPos = pos;
    }
}

/* MOUSE UP */
function mouseUp(e) {
    let pos = getMousePos(e);
    // Se o botão direito foi o levantado
    if (e.button == 2) {
        // Tente remover um nó, se o mouse estiver sobre algum
        g.removeNodeAt(pos);
        return;
    }
    adaptCursorStyle(g, false);
    
    // Se o botão esquerdo foi o levantado,
    switch (g.primaryTool) {
        // A ferramenta MOVE for a escolhida,
        case Tool.MOVE:
            // E nenhum nó tenha sido movido no gesto atual
            if (movedNode == false) {
                // Insira um nó novo
                g.insertNewNodeAt(pos);
            }
            break;

        // A ferramenta CONNECT for a escolhida
        case Tool.CONNECT:
            // Um nó estiver selecionado
            if (g.selectedNode != null) {
                // E um nó está abaixo do ponteiro do mouse atualmente
                let releasedOverNode = g.getNodeIndexAt(pos)[0];
                if (releasedOverNode != null) {
                    // Insira uma aresta conectando ambos
                    g.insertEdgeBetween(g.selectedNode, releasedOverNode)
                }
                // Pare de atualizar a aresta temporária
                g.pointerPos = null;

            // Se nenhum nó estiver selecionado
            } else {
                // Insira um nó novo
                g.insertNewNodeAt(pos);
            }
            break;
    }
    // Remova a seleção do nó
    g.selectedNode = null;
}

// Evite abrir o menu de contexto para não haver conflito com o gesto
// de deletar nós.
function contextMenuOpened(e) {
    e.preventDefault();
}

// KEYBOARD

// Tratamento da seleção da ferramenta Connect ao pressionar a tecla "meta".
// No caso do Mac a tecla em questão é Command

document.body.onkeydown = keyboardEvent;
document.body.onkeyup = keyboardEvent;

/* Variável para relembrar a ferramenta escolhida depois da tecla
   especial ser levantada. */
let lastToolChoice = Tool.MOVE;

function keyboardEvent(event) {
    let metaPressed = event.metaKey;
    if (navigator.platform.includes("Mac") == false) {
        metaPressed = event.ctrlKey;
    }
    switch (event.type) {
        case "keydown":
        // console.log(event.keyCode)
            if (event.keyCode == 69) {
                g.structure.showGraph()
            }
            if (metaPressed == true) {
                g.primaryTool = Tool.CONNECT;
            }
            break;

        case "keyup":
            if (metaPressed == false && lastToolChoice == Tool.MOVE) {
                g.primaryTool = Tool.MOVE;
            }
            break;
    }
    refreshInterfaceState()
}

/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function(e) {
    // console.log(e)
    // console.log("z");
    if (lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    refreshInterfaceState()
}

/* Atualiza a interface para que os botões reflitam o estado das ferramentas */
function refreshInterfaceState() {
    switch (g.primaryTool) {
        case Tool.MOVE:
            moveButton.disabled = true;
            connectButton.disabled = false;
            break;
        case Tool.CONNECT:
            moveButton.disabled = false;
            connectButton.disabled = true;
            break;
    }
    adaptCursorStyle(g)
}

// Executa a primeira vez
refreshInterfaceState();

function moveTool() {
    g.primaryTool = Tool.MOVE;
    lastToolChoice = Tool.MOVE;
    // console.log(g.primaryTool)
    refreshInterfaceState();
}

function connectTool() {
    g.primaryTool = Tool.CONNECT;
    lastToolChoice = Tool.CONNECT;
    // console.log(g.primaryTool)
    refreshInterfaceState();
}