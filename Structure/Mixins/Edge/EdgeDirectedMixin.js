
let EdgeDirectedMixin = (superclass) => {
    return class EdgeDirected extends superclass {
        constructor(args) {
            super(args);

            this.mixins.add(EdgeDirectedMixin);
        }
    }
}

export default EdgeDirectedMixin