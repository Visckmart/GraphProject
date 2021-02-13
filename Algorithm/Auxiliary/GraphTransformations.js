export function cloneTransformNodes(graph, Mixin) {
    // Pegando o primeiro nó para gerar a classe baseado no seu construtor
    let node = graph.nodes().next().value
    // Se esse nó não tem valor assinalado transforma o grafo para um com nós com valor assinalado
    if(!node.mixins.has(Mixin))
    {
        // Recriando o grafo agora com nós com valor assinalado
        return graph.cloneAndTransform({NodeConstructor: Mixin(node.constructor)})
    }
    return graph.clone()
}