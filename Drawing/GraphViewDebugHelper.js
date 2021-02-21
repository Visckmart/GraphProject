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