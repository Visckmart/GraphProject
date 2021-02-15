// Geração aleatória de nós
export function generateRandomNodes(graphView, quantity) {
    let i = 0;
    while (i < quantity) {
        let x = Math.random()*70+5;
        let y = Math.random()*20+5;
        x *= 10;
        y *= 10;
        if (graphView.getNodesAt({x: x, y: y}, true)[0] == null) {
            i++;
            graphView.insertNewNodeAt({x: x, y: y});
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