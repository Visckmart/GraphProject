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