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

import {nodeLabelingSelector} from "./General.js";
import {g} from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";
import {HighlightType} from "../Utilities/Highlights.js";

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

