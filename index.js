// Arquivos CSS
import "./Pages/style.css"

import "./Drawing/GraphView.js"


import {GraphInterface} from "./Drawing/GraphInterface.js";
import {canvas, CanvasType, fastOverlayCanvas, slowOverlayCanvas} from "./Drawing/General.js";

let tray = document.querySelector("#tool_tray");
let gi = new GraphInterface([canvas, slowOverlayCanvas, fastOverlayCanvas], tray);
export let g = gi.view


g.requestCanvasRefresh(CanvasType.GENERAL)
g.requestCanvasRefresh(CanvasType.SLOW)
g.slowCtx.fillStyle = "red"
g.slowCtx.fillRect(150, 150, 200, 200)
window.onresize = g.recalculateLayout.bind(g)
g.recalculateLayout()