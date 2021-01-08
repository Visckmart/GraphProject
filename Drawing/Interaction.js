import { canvas, Tool } from "./General.js"
import { g } from "./GraphView.js"

for(let element of document.querySelector("#tool_tray").children)
{
    if(element.tagName === "INPUT")
    {
        element.onchange = () => changeTool(element.value)
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

document.body.onkeydown = keyboardEvent;
document.body.onkeyup = keyboardEvent;

/* Variável para relembrar a ferramenta escolhida depois da tecla
   especial ser levantada. */
var lastToolChoice = Tool.MOVE;

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
            // if (event.keyCode == 82) {
                // g.structure.abc
            // console.log(event.keyCode)
            if (metaPressed == true) {
                if(lastToolChoice === null)
                {
                    lastToolChoice = g.primaryTool;
                }
                g.primaryTool = Tool.CONNECT;
            }
            break;

        case "keyup":
            if (metaPressed == false && lastToolChoice == Tool.MOVE) {
                g.primaryTool = Tool.MOVE;
                lastToolChoice = null;
            }
            // console.log(event.code)
            if (event.code === "Delete")
            {
                for(let node of multipleSelectedNodes)
                {
                    g.structure.removeNode(node)
                }
                multipleSelectedNodes = []
                updateMultipleSelectedNodes()
            }
            break;
    }
    refreshInterfaceState()
}

/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function(e) {
    // console.log(e)
    // console.log("z");
    // if(multipleSelection)
    // {
    //     multipleSelection = false
    //     lastMousedownPosition = null
    //     g.setSelectionRectangle(lastMousedownPosition, null)
    // }
    if (lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    refreshInterfaceState()
}

/* Atualiza a interface para que os botões reflitam o estado das ferramentas */
function refreshInterfaceState() {
    for(let element of document.querySelector("#tool_tray").children)
    {
        if(element.tagName === "INPUT" && element.value === g.primaryTool)
        {
            element.click()
        }
    }
    g.refreshCursorStyle()
}

// Executa a primeira vez
refreshInterfaceState();


function changeTool(tool) {
    g.primaryTool = tool
}