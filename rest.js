// Mouse Handling

function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

let selectedNodeIndex = null;
let movedNode = false;
function mouseDown(e) {
    // Has to be left button
    if (e.button != 0) return;

    // Prepare dragging
    let pos = getMousePos(e);
    selectedNodeIndex = g.getNodeIndexAt(pos)[0];
    movedNode = false;
}

function mouseMoved(e) {
    // If nothing is selected, stop
    if (selectedNodeIndex == null) {
        return;
    }

    // Check overlapping
    let pos = getMousePos(e);
    // let conflicts = getNodeIndexAt(pos, true);
    // conflicts = conflicts.filter(function (node) {
    //     return node != selectedNodeIndex;
    // });
    // conflicts = conflicts.splice(selectedNodeIndex, 1);
    // if (conflicts.length == 0) {
        g.moveNode(selectedNodeIndex, pos);
        movedNode = true;
    // }
    // g.redrawGraph();
}

function mouseUp(e) {
    let pos = getMousePos(e);
    if (e.button == 0) {        // If left mouse button
        selectedNodeIndex = null;
        if (movedNode == false) {
            g.insertNewNodeAt(pos);
        }
    } else if (e.button == 2) { // If right mouse button
        g.removeNodeAt(pos);
    }
}

function contextMenuOpened(e) {
    e.preventDefault();
}

// Auxiliary Functions

// Finds the first empty space on an array.
// Empty spaces are a result of `delete array[index]` statements.
function indexOfEmptySpace(array) {
    for (i = 0; i < array.length + 1; i++) {
        if (typeof array[i] == 'undefined') {
            return i;
        }
    }
}

canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("contextmenu", contextMenuOpened);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mousemove", mouseMoved);