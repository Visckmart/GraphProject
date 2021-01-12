class Edge {
    label = "E1"

    constructor(label) {
        this.label = label;
        if (new.target === Edge) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    draw({ x: xStart, y: yStart },
         { x: xEnd,   y: yEnd   })
    {
        console.warn("Nâo implementado!")
    }
}

export default Edge