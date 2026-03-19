.pragma library

// Pure mutation helpers for workflow node/connection data.
// All functions operate on plain JS objects and return nothing —
// they mutate the workflow object in-place. The caller is responsible
// for triggering QML reactivity (workflows = workflows.slice()) and
// optional DBAL persistence.

function addNodeToCanvas(wf, nodeType, posX, posY, zoom, NodeRegistry) {
    var regEntry = NodeRegistry.nodeType(nodeType)
    var newId = nodeType.replace(/\./g, "_") + "_" + Date.now()
    var newNode = {
        id: newId,
        name: regEntry.displayName || nodeType.split(".").pop(),
        type: nodeType,
        typeVersion: 1,
        position: [posX / zoom, posY / zoom],
        parameters: {},
        inputs: regEntry.inputs || [],
        outputs: regEntry.outputs || []
    }
    wf.nodes = wf.nodes.slice()
    wf.nodes.push(newNode)
    return newId
}

function removeNode(wf, nodeId) {
    wf.nodes = wf.nodes.filter(function(n) { return n.id !== nodeId })
    var newConns = {}
    for (var srcId in wf.connections) {
        if (srcId === nodeId) continue
        var srcConns = wf.connections[srcId]
        var newSrcConns = {}
        for (var outName in srcConns) {
            var newOut = {}
            for (var idx in srcConns[outName]) {
                var targets = srcConns[outName][idx].filter(
                    function(t) { return t.node !== nodeId })
                if (targets.length > 0) newOut[idx] = targets
            }
            if (Object.keys(newOut).length > 0) newSrcConns[outName] = newOut
        }
        if (Object.keys(newSrcConns).length > 0) newConns[srcId] = newSrcConns
    }
    wf.connections = newConns
}

function addConnection(wf, srcNodeId, srcPort, dstNodeId, dstPort) {
    if (srcNodeId === dstNodeId) return false
    if (!wf.connections) wf.connections = {}
    if (!wf.connections[srcNodeId]) wf.connections[srcNodeId] = {}
    if (!wf.connections[srcNodeId][srcPort]) wf.connections[srcNodeId][srcPort]
        = {}
    if (!wf.connections[srcNodeId][srcPort]["0"])
        wf.connections[srcNodeId][srcPort]["0"] = []
    var existing = wf.connections[srcNodeId][srcPort]["0"]
    for (var i = 0; i < existing.length; i++) {
        if (existing[i].node === dstNodeId) return false
    }
    existing.push({ node: dstNodeId, type: dstPort, index: 0 })
    return true
}

function updateNodeName(wf, nodeId, name) {
    for (var i = 0; i < wf.nodes.length; i++) {
        if (wf.nodes[i].id === nodeId) {
            wf.nodes[i].name = name
            return
        }
    }
}

function updateNodeParameter(wf, nodeId, key, value) {
    for (var i = 0; i < wf.nodes.length; i++) {
        if (wf.nodes[i].id === nodeId) {
            if (!wf.nodes[i].parameters) wf.nodes[i].parameters = {}
            wf.nodes[i].parameters[key] = value
            return
        }
    }
}

function moveNode(wf, nodeId, x, y) {
    for (var i = 0; i < wf.nodes.length; i++) {
        if (wf.nodes[i].id === nodeId) {
            wf.nodes[i].position = [x, y]
            return
        }
    }
}
