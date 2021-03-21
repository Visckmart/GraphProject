import {nodeLabelingSelector} from "./General.js";
import {g} from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";
import {HighlightType} from "../Structure/Highlights.js";

nodeLabelingSelector.onchange = function(e) {
    g.nodeLabeling = e.target.value;
    g.refreshGraph();
}

let tray = document.querySelector("#tool_tray");
let trayItems = tray.getElementsByClassName("trayItem");
let trayInputs = tray.getElementsByTagName("input");
let trayIcons = tray.getElementsByClassName("icon");


for (let item of trayItems) {
    let c = item.getElementsByTagName("input")[0];
    item.addEventListener("click", () => {
        c.checked = true;
    });
}
for (let inputElement of trayInputs) {
    let eventHandler;
    console.log(inputElement)
    switch (inputElement.name) {
    case "tool":
        eventHandler = function() {
            g.primaryTool = inputElement.value;
        }
        break;
    case "feature":
        eventHandler = function() {
            ToolRepository[inputElement.value].bind(g)();
            inputElement.checked = false;
        }
        break;
    }
    if (eventHandler) { inputElement.addEventListener("change", eventHandler); }
}

// EXTRA: Fazer hover para outras ferramentas
//        Comentado enquanto o hover das outras ferramentas não está implementado
// function iconHover(mouseEvent) {
//     let mouseEnter = mouseEvent.type == "mouseenter";
//     let nodesToDisconnect;
//     if (g.selectionHandler.hasSelectedNodes > 0) {
//         nodesToDisconnect = g.selectionHandler.selected.nodes;
//     } else {
//         nodesToDisconnect = Array.from(g.structure.nodes())
//     }
//     let associatedInput = this.parentElement.previousElementSibling;
//     if (associatedInput.value == "disconnect_all") {
//         for (let [edge, nodeA, nodeB] of g.structure.uniqueEdges()) {
//             if (mouseEnter
//                 && (nodesToDisconnect.includes(nodeA)
//                     || nodesToDisconnect.includes(nodeB))) {
//                 edge.highlights.add(HighlightType.FEATURE_PREVIEW)
//             }
//             if (mouseEnter == false && associatedInput.value == "disconnect_all") {
//                 edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
//             }
//         }
//     }
//
// }
// for (let icon of trayIcons) {
//     icon.addEventListener("mouseenter", iconHover.bind(icon));
//     icon.addEventListener("mouseleave", iconHover.bind(icon));
// }