.pragma library

// DBAL persistence and tree manipulation helpers
// for component hierarchy.

function childrenCount(treeNodes, idx) {
    if (idx < 0 || idx >= treeNodes.length) return 0
    var parentDepth = treeNodes[idx].depth
    var count = 0
    for (var i = idx + 1;
         i < treeNodes.length; i++) {
        if (treeNodes[i].depth <= parentDepth) break
        if (treeNodes[i].depth === parentDepth + 1)
            count++
    }
    return count
}

function subtreeEnd(treeNodes, idx) {
    var parentDepth = treeNodes[idx].depth
    var i = idx + 1
    while (i < treeNodes.length
           && treeNodes[i].depth > parentDepth)
        i++
    return i
}

function addChild(treeNodes, parentIdx, nextNodeId,
                  dbal, useLiveData, loadFn) {
    if (parentIdx < 0
        || parentIdx >= treeNodes.length)
        return null
    var insertAt = subtreeEnd(treeNodes, parentIdx)
    var newNode = {
        nodeId: nextNodeId,
        name: "NewComponent",
        type: "atom",
        depth: treeNodes[parentIdx].depth + 1,
        visible: true,
        props: []
    }
    if (useLiveData)
        dbal.create("component_node", newNode,
            function(r, e) { if (!e) loadFn() })
    var updated = treeNodes.slice()
    updated.splice(insertAt, 0, newNode)
    return {
        nodes: updated,
        selectedIndex: insertAt
    }
}

function removeNode(treeNodes, idx, dbal,
                    useLiveData, loadFn) {
    if (idx < 0 || idx >= treeNodes.length
        || treeNodes[idx].depth === 0)
        return null
    if (useLiveData && treeNodes[idx].id)
        dbal.remove("component_node",
            treeNodes[idx].id,
            function(r, e) { if (!e) loadFn() })
    var endIdx = subtreeEnd(treeNodes, idx)
    var updated = treeNodes.slice()
    updated.splice(idx, endIdx - idx)
    var sel = idx < updated.length
        ? idx
        : (updated.length > 0
            ? updated.length - 1 : -1)
    return { nodes: updated, selectedIndex: sel }
}

function updateNode(treeNodes, idx, field, value) {
    if (idx < 0 || idx >= treeNodes.length)
        return treeNodes
    var updated = treeNodes.slice()
    updated[idx] = Object.assign({}, updated[idx])
    updated[idx][field] = value
    return updated
}

function addProp(treeNodes, idx) {
    if (idx < 0 || idx >= treeNodes.length)
        return treeNodes
    var updated = treeNodes.slice()
    var node = Object.assign({}, updated[idx])
    var newProps = node.props.slice()
    newProps.push({ key: "newProp", value: "" })
    node.props = newProps
    updated[idx] = node
    return updated
}

function removeProp(treeNodes, nodeIdx, propIdx) {
    if (nodeIdx < 0
        || nodeIdx >= treeNodes.length)
        return treeNodes
    var updated = treeNodes.slice()
    var node = Object.assign({}, updated[nodeIdx])
    var newProps = node.props.slice()
    newProps.splice(propIdx, 1)
    node.props = newProps
    updated[nodeIdx] = node
    return updated
}

function saveNode(dbal, treeNodes, idx, loadFn) {
    var node = treeNodes[idx]
    var data = {
        nodeId: node.nodeId,
        name: node.name,
        type: node.type,
        depth: node.depth,
        visible: node.visible,
        props: node.props
    }
    if (node.id)
        dbal.update("component_node", node.id,
            data,
            function(r, e) { if (!e) loadFn() })
    else
        dbal.create("component_node", data,
            function(r, e) { if (!e) loadFn() })
}

function loadComponents(dbal, callback) {
    dbal.list("component_node", { take: 200 },
        function(result, error) {
        if (!error && result && result.items
            && result.items.length > 0) {
            var parsed = []
            var maxId = 0
            for (var i = 0;
                 i < result.items.length; i++) {
                var n = result.items[i]
                var nid = n.nodeId || n.id || i
                if (nid > maxId) maxId = nid
                parsed.push({
                    id: n.id,
                    nodeId: nid,
                    name: n.name || "Component",
                    type: n.type || "atom",
                    depth: n.depth !== undefined
                        ? n.depth : 0,
                    visible: n.visible !== undefined
                        ? n.visible : true,
                    props: n.props || []
                })
            }
            callback(parsed, maxId + 1)
        }
    })
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", relativePath, false)
    xhr.send()
    if (xhr.status === 200 || xhr.status === 0)
        try { return JSON.parse(xhr.responseText) }
        catch(e) { return [] }
    return []
}
