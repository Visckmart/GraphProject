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