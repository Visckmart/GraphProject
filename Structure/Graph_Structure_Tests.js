import Node from './Node.js'
import UndirectedGraph from "./UndirectedGraph.js";
import DirectedGraph from "./DirectedGraph.js";
import Edge from "./Edge.js";

let gs = new UndirectedGraph()
// gs.showGraph()
let n1 = new Node(10, 20, "A")
gs.insertNode(n1)
let n2 = new Node(10, 30, "B")
gs.insertNode(n2)
let n3 = new Node(10, 20, "C")
gs.insertNode(n3)
let e1 = new Edge("E1")
let e2 = new Edge("E2")
gs.insertEdge(n1, n2, e1)
gs.insertEdge(n1, n3, e2)
gs.showGraph()

// for (let [edge, _] of gs.edges()) {
//     console.log(edge)
// }

// gs.removeEdge()
gs.removeEdge(e1)
// gs.removeEdge("a")
gs.showGraph()
gs.removeEdgeBetween(n1, n3)
gs.showGraph()
// console.log(gs.getEdgeBetween("1", n3))
// console.log(gs.checkEdgeBetween("1", n3))
// console.log(gs.getEdgeBetween(n1, n3))
// console.log(gs.checkEdgeBetween(n1, n3))

function getNodeAt(x, y) {
    for (let node of gs.nodes()) {
        if (node.x == x && node.y == y) {
            return node;
        }
    }
}


let dg = new DirectedGraph()
// dg.insertNode(n1)
// dg.showGraph()
// gs = new Graph_Structure()
// gs.showGraph()
n1 = new Node(10, 20, "A")
dg.insertNode(n1)
n2 = new Node(10, 30, "B")
dg.insertNode(n2)
n3 = new Node(10, 20, "C")
dg.insertNode(n3)
// let e1 = new Edge("E1")
// let e2 = new Edge("E2")
dg.insertEdge(n1, n2, e1)
dg.insertEdge(n1, n3, e2)
dg.showGraph()
dg.removeEdge(e1)
dg.showGraph()
dg.removeEdgeBetween(n1, n3)
dg.showGraph()
// console.log(getNodeAt(10, 20))
// console.log(1)
// console.info(1)
// console.warn(1)
// console.error(1)

// for (let node of gs.nodes()) {
//     console.log(node)
// }
// gs.showGraph()

// function* x() {
//     yield 10;
//     yield 11;
// }

// for (let z of x()) {
//     console.log(z)
// }

// let y = x()
// console.log(y.next())
// console.log(y.next())
// console.log(y.next())