import { TrayHandler } from "./ToolInteraction.js";
import { GraphView, isMobile } from "./GraphView.js";
import ToolRepository from "./ToolRepository.js";

// let isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
export class GraphInterface {
    constructor(view, tray) {
        this.view = new GraphView(this, view[0], view[1], view[2], !isMobile);
        this.tray = new TrayHandler(tray, this);
    }

    didUpdateTray(targetElement) {
        // console.log(type, name)
        switch (targetElement.name) {
        case "tool":
            this.view.primaryTool = targetElement.value;
            break;
        case "feature":
            ToolRepository[targetElement.value].bind(this.view)();
            targetElement.checked = false;
            break;
        }
    }

    didChangeTool(tool) {
        this.tray.refreshIcons(tool);
        this.view.mouseHandler.refreshCursorStyle();
    }
}