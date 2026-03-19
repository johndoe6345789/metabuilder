import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property var treeNodes: [
        { nodeId: 0,  name: "App",            type: "container", depth: 0, visible: true, props: [{ key: "maxWidth", value: "1280" }] },
        { nodeId: 1,  name: "NavBar",          type: "layout",    depth: 1, visible: true, props: [{ key: "sticky", value: "true" }, { key: "height", value: "64" }] },
        { nodeId: 2,  name: "MainContent",     type: "container", depth: 1, visible: true, props: [{ key: "padding", value: "24" }] },
        { nodeId: 3,  name: "HeroSection",     type: "widget",    depth: 2, visible: true, props: [{ key: "title", value: "Welcome" }, { key: "backgroundImage", value: "hero.png" }] },
        { nodeId: 4,  name: "FeatureGrid",     type: "layout",    depth: 2, visible: true, props: [{ key: "columns", value: "3" }, { key: "gap", value: "16" }] },
        { nodeId: 5,  name: "FeatureCard",     type: "atom",      depth: 3, visible: true, props: [{ key: "icon", value: "speed" }, { key: "label", value: "Fast" }] },
        { nodeId: 6,  name: "FeatureCard",     type: "atom",      depth: 3, visible: true, props: [{ key: "icon", value: "shield" }, { key: "label", value: "Secure" }] },
        { nodeId: 7,  name: "FeatureCard",     type: "atom",      depth: 3, visible: true, props: [{ key: "icon", value: "plug" }, { key: "label", value: "Extensible" }] },
        { nodeId: 8,  name: "ContactForm",     type: "widget",    depth: 2, visible: true, props: [{ key: "action", value: "/api/contact" }] },
        { nodeId: 9,  name: "Footer",          type: "layout",    depth: 1, visible: true, props: [{ key: "copyright", value: "2026" }] },
        { nodeId: 10, name: "Sidebar",         type: "container", depth: 1, visible: true, props: [{ key: "width", value: "280" }, { key: "collapsible", value: "true" }] },
        { nodeId: 11, name: "NavigationList",  type: "widget",    depth: 2, visible: true, props: [{ key: "items", value: "5" }] },
        { nodeId: 12, name: "UserPanel",       type: "widget",    depth: 2, visible: true, props: [{ key: "showAvatar", value: "true" }] }
    ]

    property int selectedIndex: -1
    property int nextNodeId: 13

    function childrenCount(idx) {
        if (idx < 0 || idx >= treeNodes.length) return 0
        var parentDepth = treeNodes[idx].depth; var count = 0
        for (var i = idx + 1; i < treeNodes.length; i++) {
            if (treeNodes[i].depth <= parentDepth) break
            if (treeNodes[i].depth === parentDepth + 1) count++
        }
        return count
    }

    function subtreeEnd(idx) {
        var parentDepth = treeNodes[idx].depth; var i = idx + 1
        while (i < treeNodes.length && treeNodes[i].depth > parentDepth) i++
        return i
    }

    function addChild(parentIdx) {
        if (parentIdx < 0 || parentIdx >= treeNodes.length) return
        var insertAt = subtreeEnd(parentIdx)
        var newNode = { nodeId: nextNodeId, name: "NewComponent", type: "atom", depth: treeNodes[parentIdx].depth + 1, visible: true, props: [] }
        nextNodeId++
        if (useLiveData) dbal.create("component_node", newNode, function(r, e) { if (!e) loadComponents() })
        var updated = treeNodes.slice(); updated.splice(insertAt, 0, newNode); treeNodes = updated; selectedIndex = insertAt
    }

    function removeNode(idx) {
        if (idx < 0 || idx >= treeNodes.length || treeNodes[idx].depth === 0) return
        if (useLiveData && treeNodes[idx].id) dbal.remove("component_node", treeNodes[idx].id, function(r, e) { if (!e) loadComponents() })
        var endIdx = subtreeEnd(idx); var updated = treeNodes.slice(); updated.splice(idx, endIdx - idx); treeNodes = updated
        if (selectedIndex >= treeNodes.length) selectedIndex = treeNodes.length - 1
        if (selectedIndex < 0) selectedIndex = -1
    }

    function updateNode(idx, field, value) {
        if (idx < 0 || idx >= treeNodes.length) return
        var updated = treeNodes.slice()
        updated[idx] = Object.assign({}, updated[idx]); updated[idx][field] = value
        treeNodes = updated; saveNode(idx)
    }

    function addPropToNode(idx) {
        if (idx < 0 || idx >= treeNodes.length) return
        var updated = treeNodes.slice(); var node = Object.assign({}, updated[idx])
        var newProps = node.props.slice(); newProps.push({ key: "newProp", value: "" }); node.props = newProps
        updated[idx] = node; treeNodes = updated
    }

    function removePropFromNode(nodeIdx, propIdx) {
        if (nodeIdx < 0 || nodeIdx >= treeNodes.length) return
        var updated = treeNodes.slice(); var node = Object.assign({}, updated[nodeIdx])
        var newProps = node.props.slice(); newProps.splice(propIdx, 1); node.props = newProps
        updated[nodeIdx] = node; treeNodes = updated
    }

    // ── DBAL Integration ─────────────────────────────────────────────
    function loadComponents() {
        dbal.list("component_node", { take: 200 }, function(result, error) {
            if (!error && result && result.items && result.items.length > 0) {
                var parsed = []; var maxId = 0
                for (var i = 0; i < result.items.length; i++) {
                    var n = result.items[i]; var nid = n.nodeId || n.id || i
                    if (nid > maxId) maxId = nid
                    parsed.push({ id: n.id, nodeId: nid, name: n.name || "Component", type: n.type || "atom", depth: n.depth !== undefined ? n.depth : 0, visible: n.visible !== undefined ? n.visible : true, props: n.props || [] })
                }
                treeNodes = parsed; nextNodeId = maxId + 1
            }
        })
    }

    function saveNode(idx) {
        if (!useLiveData) return
        var node = treeNodes[idx]
        var data = { nodeId: node.nodeId, name: node.name, type: node.type, depth: node.depth, visible: node.visible, props: node.props }
        if (node.id) dbal.update("component_node", node.id, data, function(r, e) { if (!e) loadComponents() })
        else dbal.create("component_node", data, function(r, e) { if (!e) loadComponents() })
    }

    onUseLiveDataChanged: { if (useLiveData) loadComponents() }
    Component.onCompleted: { loadComponents() }

    // ── UI ───────────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 16

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "Component Hierarchy Editor" }
            Item { Layout.fillWidth: true }
            CChip { text: treeNodes.length + " components" }
        }

        CAlert {
            Layout.fillWidth: true; severity: "info"
            text: "Drag-and-drop reordering is planned. Use Add Child / Remove to modify the tree structure."
        }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

            CCard {
                Layout.preferredWidth: 420; Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 10

                    FlexRow {
                        Layout.fillWidth: true; spacing: 8
                        CText { variant: "h4"; text: "Component Tree" }
                        Item { Layout.fillWidth: true }
                        CButton { text: "Add Child"; variant: "primary"; size: "sm"; enabled: selectedIndex >= 0; onClicked: addChild(selectedIndex) }
                        CButton { text: "Remove"; variant: "danger"; size: "sm"; enabled: selectedIndex > 0; onClicked: removeNode(selectedIndex) }
                    }

                    CDivider { Layout.fillWidth: true }
                    CComponentTypeLegend { }
                    CDivider { Layout.fillWidth: true }

                    ListView {
                        id: treeList
                        Layout.fillWidth: true; Layout.fillHeight: true
                        model: treeNodes; clip: true; spacing: 2

                        delegate: CComponentTreeRow {
                            node: modelData
                            isSelected: index === selectedIndex
                            childCount: childrenCount(index)
                            onClicked: selectedIndex = index
                        }
                    }
                }
            }

            CCard {
                Layout.fillWidth: true; Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 12

                    CText { variant: "h4"; text: "Component Properties" }
                    CDivider { Layout.fillWidth: true }

                    Item {
                        visible: selectedIndex < 0 || selectedIndex >= treeNodes.length
                        Layout.fillWidth: true; Layout.fillHeight: true
                        CText { anchors.centerIn: parent; variant: "body2"; text: "Select a component from the tree to view its properties."; opacity: 0.5 }
                    }

                    CComponentPropertiesPanel {
                        visible: selectedIndex >= 0 && selectedIndex < treeNodes.length
                        node: selectedIndex >= 0 && selectedIndex < treeNodes.length ? treeNodes[selectedIndex] : null
                        childCount: childrenCount(selectedIndex)
                        onNameChanged: function(name) { updateNode(selectedIndex, "name", name) }
                        onTypeChanged: function(type) { updateNode(selectedIndex, "type", type) }
                        onVisibleChanged: function(vis) { updateNode(selectedIndex, "visible", vis) }
                        onAddProp: addPropToNode(selectedIndex)
                        onRemoveProp: function(index) { removePropFromNode(selectedIndex, index) }
                    }
                }
            }
        }
    }
}
