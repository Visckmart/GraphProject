export function cloneTransformNodes(graph, Mixin) {
    // Se esse nó não tem valor assinalado transforma o grafo para um com nós com valor assinalado
    if(!graph.NodeConstructor.getMixins().has(Mixin))
    {
        // Recriando o grafo agora com nós com valor assinalado
        return graph.cloneAndTransform({
                                           NodeConstructor: Mixin(graph.NodeConstructor)
        })
    }
    return graph.clone()
}

export function mapNewNodesOrEdges(oldArtifacts, newArtifacts, newToOld = true) {
    let artifactIdMap = new Map()
    let artifactMap = new Map()

    for(let artifact of oldArtifacts) {
        artifactIdMap.set(artifact.index, artifact)
    }
    for(let artifact of newArtifacts) {
        if(newToOld) {
            artifactMap.set(artifact, artifactIdMap.get(artifact.index))
        } else {
            artifactMap.set(artifactIdMap.get(artifact.index), artifact)
        }
    }
    return artifactMap
}