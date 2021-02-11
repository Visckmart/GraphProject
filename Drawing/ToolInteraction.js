import {nodeLabelingSelector} from "./General.js";
import {g} from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";
import {HighlightType} from "../Structure/Highlights.js";

nodeLabelingSelector.onchange = function(e) { g.nodeLabeling = e.target.value }

let tray = document.querySelector("#tool_tray");
let trayInputs = tray.getElementsByTagName("input");
let trayIcons = tray.getElementsByClassName("icon");
for (let inputElement of trayInputs) {
    let eventHandler;
    if ("tool" == inputElement.name) {
        eventHandler = () => {
            g.changeTool(inputElement.value);
        }
    } else if ("feature" == inputElement.name) {
        eventHandler = () => {
            ToolRepository[inputElement.value].bind(g)();
            inputElement.checked = false;
        }
    }
    inputElement.addEventListener("change", eventHandler);
}
for (let icon of trayIcons) {
    icon.addEventListener("mouseenter", function (e) {
        let nodesToDisconnect;
        if (g.selectionHandler.hasSelectedNodes > 0) {
            nodesToDisconnect = g.selectionHandler.selected.nodes;
        } else {
            nodesToDisconnect = Array.from(g.structure.nodes())
        }
        let associatedInput = icon.parentElement.previousElementSibling;
        if (associatedInput.value == "disconnect_all") {
            for (let [edge, nodeA, nodeB] of g.structure.uniqueEdges()) {
                if (nodesToDisconnect.includes(nodeA)
                    || nodesToDisconnect.includes(nodeB)) {
                    edge.highlights.add(HighlightType.FEATURE_PREVIEW)
                }
            }
        }
    })

    icon.addEventListener("mouseleave", function (e) {
        // console.log(x.parentElement.previousElementSibling.value)
        if (icon.parentElement.previousElementSibling.value == "disconnect_all") {
            for (let [edge, ,] of g.structure.uniqueEdges()) {
                edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
            }
        }
    })
    // x.style.backgroundColor = "red"
}