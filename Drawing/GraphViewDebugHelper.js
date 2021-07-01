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

// Geração aleatória de nós
export function generateRandomNodes(graphView, quantity) {
    let i = 0;
    let tries = 0;
    while (i < quantity) {
        if (tries > 10*quantity) {
            return;
        }
        let x = Math.random()*graphView.canvas.width+50;
        let y = Math.random()*graphView.canvas.height+30;
        x *= 0.75;
        y *= 0.5;
        if (graphView.checkIfNodeAt({x: x, y: y}, true)) {
            i++;
            graphView.insertNewNodeAt({x: x, y: y});
        } else {
            tries += 1;
        }
    }
}

// Geração aleatória de arestas
export function generateRandomEdges(graphView, quantity) {
    let i = 0;
    for (let nodeA of graphView.structure.nodes()) {
        for (let nodeB of graphView.structure.nodes()) {
            if (i >= quantity) return;
            let x = Math.random() < 0.5;
            if (x && nodeA != nodeB) {
                i++
                graphView.insertEdgeBetween(nodeA, nodeB);
            }
        }
    }
}