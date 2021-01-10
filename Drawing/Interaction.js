import { canvas, Tool, nodeLabelingSelector } from "./General.js"
import { g } from "./GraphView.js"

nodeLabelingSelector.onchange = function(e) { g.nodeLabeling = e.target.value }
for(let element of document.querySelector("#tool_tray").children)
{
    if(element.tagName === "INPUT")
    {
        element.addEventListener("change", () => g.changeTool(element.value))
    }

    if(element.tagName === "BUTTON")
    {
        element.addEventListener("click", () => g.useTool(element.value))
    }
}

canvas.addEventListener("mousedown", g.mouseDownEvent);
canvas.addEventListener("contextmenu", contextMenuOpened);
canvas.addEventListener("mouseup", g.mouseUpEvent);
canvas.addEventListener("mousemove", g.mouseDragEvent);


// Evite abrir o menu de contexto para não haver conflito com o gesto
// de deletar nós.
function contextMenuOpened(e) {
    e.preventDefault();
}

// KEYBOARD

// Tratamento da seleção da ferramenta Connect ao pressionar a tecla "meta".
// No caso do Mac a tecla em questão é Command

document.body.onkeydown = g.keyPressed;
document.body.onkeyup = g.keyReleased;

/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function(e) {
    if (g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    g.refreshInterfaceState()
}

// Executa a primeira vez
g.refreshInterfaceState();
