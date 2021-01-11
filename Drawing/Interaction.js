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


/* Caso a página tenha perdido o foco, considere que a tecla meta foi solta */
document.body.onblur = function(e) {
    if (g.lastToolChoice == Tool.MOVE) {
        g.primaryTool = Tool.MOVE;
    }
    g.refreshInterfaceState()
}

// Executa a primeira vez
g.refreshInterfaceState();
