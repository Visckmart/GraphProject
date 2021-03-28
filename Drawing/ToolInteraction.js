import {nodeLabelingSelector} from "./General.js";
import {g} from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";
import {HighlightType} from "../Structure/Highlights.js";

nodeLabelingSelector.onchange = function(e) {
    g.nodeLabeling = e.target.value;
    g.refreshGraph();
}
export class TrayHandler {

    constructor(trayElement, delegate) {
        this.delegate = delegate;
        this.trayItems = trayElement.getElementsByClassName("trayItem");
        this.trayInputs = trayElement.getElementsByTagName("input");
        this.trayIcons = trayElement.getElementsByClassName("icon");

        // Repassa os cliques no item para o elemento input
        for (let item of this.trayItems) {
            let inputElement = item.getElementsByTagName("input")[0];
            item.addEventListener("click", () => {
                inputElement.checked = true;
                this.delegate.didUpdateTray(inputElement);
            });
        }

        // Lida com o caso da input ser atualizada diretamente
        for (let inputElement of this.trayInputs) {
            inputElement.addEventListener("change", () => {
                this.delegate.didUpdateTray(inputElement);
            });
        }

        // for (let icon of this.trayIcons) {
        //     icon.addEventListener("mouseenter", this.hoverHandler.bind(icon));
        //     icon.addEventListener("mouseleave", this.hoverHandler.bind(icon));
        // }
    }

    refreshIcons(primaryTool) {
        for (let element of this.trayInputs) {
            if (element.value === primaryTool) { element.click(); }
        }
    }

    // EXTRA: Fazer hover para outras ferramentas
    //        Comentado enquanto o hover das outras ferramentas não está implementado
    // hoverHandler(mouseEvent) {
    //     let mouseEnter = mouseEvent.type == "mouseenter";
    //     let nodesToDisconnect;
    //     if (g.selectionHandler.hasSelectedNodes) {
    //         nodesToDisconnect = g.selectionHandler.selected.nodes;
    //     } else {
    //         nodesToDisconnect = Array.from(g.structure.nodes())
    //     }
    //
    //     let associatedInput = mouseEvent.target.previousElementSibling;
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
    // }

}

