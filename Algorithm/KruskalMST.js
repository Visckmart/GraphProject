import UnionFind from "./Auxiliary/UnionFind.js";
import {HighlightType} from "../Structure/Highlights.js";


let pseudoCode = [
`\
<span>Inicializando estrutura de union-find com todos os 
nós sozinhos em seus grupos representando as florestas</span>
unionFind = UnionFind(nós) 
<span>Ordenando as arestas pelo seus pesos em ordem 
decrescente para acelerar a busca pela menor aresta</span>
arestas = ordenar(arestas, peso) 
`,
`\
while(arestas.length > 0) {
  <span>Retirando a última (e menor) aresta da lista</span>
  menorAresta = arestas.pop() 
`,
`\
  <span>Caso as pontas da menorAresta estejam em grupos diferentes</span>
  if (!unionFind.mesmoGrupo(nós que menorAresta liga)) {
      <span>Unindo os nós na ponta da aresta, incluindo ela na floresta</span>
      unionFind.une(nós que a menorAresta liga)
  }
`,
`\
  <span>Caso as pontas da menorAresta estejam no MESMO grupo</span>
  else {
      Aresta não incluída
  }
`,
`\
}
`,
`\
if(todos os nós foram alcançados) {
  A MST foi encontrada
}
`,
`\
else {
 O grafo era desconexo e uma MST não foi encontrada
}
`
]
let pseudoLabels = [
    'init', 'loopStart', 'include', 'notInclude', '', 'found', 'notFound'
]

export default function KruskalMST(controller) {
    let graph = controller.graphView.structure

    controller.setPseudocode(pseudoCode, pseudoLabels)

    let nodes = Array.from(graph.nodes())
    let unionFind = new UnionFind(nodes)
    controller.showcasing = unionFind

    let edges = Array.from(graph.uniqueEdges())
    edges.sort((e1, e2) => e2[0].assignedValue - e1[0].assignedValue)

    edges.forEach(([edge,,]) => {
        edge.highlights.add(HighlightType.DISABLED)
    })

    controller.addStep(graph, `Inicializando uma floresta com ${nodes.length} árvores compostas por nós desconexos. \
    Ordenando as arestas pelos seus pesos`, 'init')

    while(edges.length > 0) {
        let [edge, nodeA, nodeB] = edges.pop()

        edge.highlights.remove(HighlightType.DISABLED)
        edge.highlights.add(HighlightType.COLORED_A)
        controller.addStep(graph, 'Retirando a aresta remanescente com menor peso.', 'loopStart')
        edge.highlights.remove(HighlightType.COLORED_A)


        if(unionFind.find(nodeA) !== unionFind.find(nodeB)) {
            edge.highlights.remove(HighlightType.DISABLED)
            edge.highlights.add(HighlightType.DARK_WITH_BLINK)

            nodeA.highlights.add(HighlightType.COLORED_BORDER2)
            nodeB.highlights.add(HighlightType.COLORED_BORDER2)

            unionFind.union(nodeA, nodeB)

            controller.addStep(graph, `A aresta conecta duas florestas diferentes contendo os nós \
            ${nodeA.toString()} e ${nodeB.toString()} e portanto será inclusa, unindo-as.`, 'include')

            nodeA.highlights.remove(HighlightType.COLORED_BORDER2)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER2)

            edge.highlights.remove(HighlightType.DARK_WITH_BLINK)
        } else {
            edge.highlights.add(HighlightType.FEATURE_PREVIEW)

            nodeA.highlights.add(HighlightType.COLORED_BORDER2)
            nodeB.highlights.add(HighlightType.COLORED_BORDER2)

            controller.addStep(graph, `A aresta conecta dois s nós \
            ${nodeA.toString()} e ${nodeB.toString()} da mesma floresta \
             e portanto não será inclusa.`, 'notInclude')

            nodeA.highlights.remove(HighlightType.COLORED_BORDER2)
            nodeB.highlights.remove(HighlightType.COLORED_BORDER2)

            edge.highlights.remove(HighlightType.FEATURE_PREVIEW)
        }
    }

    let parent = unionFind.find(nodes[0], false)
    if(nodes.some(node => unionFind.find(node, false) !== parent)) {
        controller.addStep(graph, 'O grafo era desconexo e uma MST não foi encontrada.', 'found')
    } else {
        controller.addStep(graph, 'Todas as florestas foram unidas e a MST foi encontrada.', 'notFound')
    }
}