import { TrayHandler } from "./ToolInteraction.js";
import { g } from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";

export class GraphInterface {
    constructor(view, tray) {
        this.view = view;
        this.tray = new TrayHandler(tray, this);
    }

    didUpdateTray(targetElement) {
        // console.log(type, name)
        switch (targetElement.name) {
        case "tool":
            this.view.primaryTool = targetElement.value;
            break;
        case "feature":
            ToolRepository[targetElement.value].bind(g)();
            targetElement.checked = false;
            break;
        }
    }
}