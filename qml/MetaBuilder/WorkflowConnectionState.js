.pragma library

// Pure functions for the connection-drawing state machine.
// The caller passes in current state and gets back new state values.

function startDrag(nodeId, portName, isOutput, portX, portY) {
    return {
        drawingConnection: true,
        connSourceNode: nodeId,
        connSourcePort: portName,
        connSourceIsOutput: isOutput,
        connDragX: portX,
        connDragY: portY
    }
}

function updateDrag(x, y) {
    return { connDragX: x, connDragY: y }
}

function finishDrag() {
    return {
        drawingConnection: false,
        connSourceNode: "",
        connSourcePort: "",
        connSourceIsOutput: true,
        connDragX: 0,
        connDragY: 0
    }
}
