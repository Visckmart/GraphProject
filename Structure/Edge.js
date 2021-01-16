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

    serialize() {
        // Serializando somente informações importantes da aresta
        return JSON.stringify({
            l: this.label
        })
    }

    static deserialize(string) {
        console.warn("Can't deserialize abstract class")
        return null
    }
}

export default Edge