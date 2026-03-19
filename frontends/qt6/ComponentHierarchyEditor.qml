import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    // Flat array representing tree structure; depth encodes hierarchy
    property var mockTreeNodes: [
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

    // Count direct children of a node at a given index
    function childrenCount(idx) {
        if (idx < 0 || idx >= treeNodes.length) return 0
        var parentDepth = treeNodes[idx].depth
        var count = 0
        for (var i = idx + 1; i < treeNodes.length; i++) {
            if (treeNodes[i].depth <= parentDepth) break
            if (treeNodes[i].depth === parentDepth + 1) count++
        }
        return count
    }

    // Find the insertion index for a new child (after all descendants of the node)
    function subtreeEnd(idx) {
        var parentDepth = treeNodes[idx].depth
        var i = idx + 1
        while (i < treeNodes.length && treeNodes[i].depth > parentDepth) i++
        return i
    }

    function addChild(parentIdx) {
        if (parentIdx < 0 || parentIdx >= treeNodes.length) return
        var insertAt = subtreeEnd(parentIdx)
        var newNode = {
            nodeId: nextNodeId,
            name: "NewComponent",
            type: "atom",
            depth: treeNodes[parentIdx].depth + 1,
            visible: true,
            props: []
        }
        nextNodeId++
        if (useLiveData) {
            dbal.create("component_node", newNode, function(r, e) { if (!e) loadComponents() })
        }
        var updated = treeNodes.slice()
        updated.splice(insertAt, 0, newNode)
        treeNodes = updated
        selectedIndex = insertAt
    }

    function removeNode(idx) {
        if (idx < 0 || idx >= treeNodes.length) return
        // Prevent removing root
        if (treeNodes[idx].depth === 0) return
        if (useLiveData && treeNodes[idx].id) {
            dbal.remove("component_node", treeNodes[idx].id, function(r, e) { if (!e) loadComponents() })
        }
        var endIdx = subtreeEnd(idx)
        var updated = treeNodes.slice()
        updated.splice(idx, endIdx - idx)
        treeNodes = updated
        if (selectedIndex >= treeNodes.length) selectedIndex = treeNodes.length - 1
        if (selectedIndex < 0) selectedIndex = -1
    }

    function typeBadgeColor(nodeType) {
        switch (nodeType) {
            case "container": return "#5C6BC0"
            case "layout":    return "#26A69A"
            case "widget":    return "#FFA726"
            case "atom":      return "#EF5350"
            default:          return Theme.primary
        }
    }

    function treeConnector(depth) {
        var s = ""
        for (var i = 0; i < depth; i++) {
            s += (i === depth - 1) ? " \u251C\u2500 " : " \u2502  "
        }
        return s
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
    onUseLiveDataChanged: { if (useLiveData) loadComponents() }
    Component.onCompleted: { loadComponents() }
    function saveNode(idx) {
        if (!useLiveData) return
        var node = treeNodes[idx]
        var data = { nodeId: node.nodeId, name: node.name, type: node.type, depth: node.depth, visible: node.visible, props: node.props }
        if (node.id) dbal.update("component_node", node.id, data, function(r, e) { if (!e) loadComponents() })
        else dbal.create("component_node", data, function(r, e) { if (!e) loadComponents() })
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // Header
        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h3"; text: "Component Hierarchy Editor" }
            Item { Layout.fillWidth: true }
            CChip { text: treeNodes.length + " components" }
        }

        CAlert {
            Layout.fillWidth: true
            severity: "info"
            text: "Drag-and-drop reordering is planned. Use Add Child / Remove to modify the tree structure."
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // LEFT PANEL - Tree View
            CCard {
                Layout.preferredWidth: 420
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 10

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText { variant: "h4"; text: "Component Tree" }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Add Child"
                            variant: "primary"
                            size: "sm"
                            enabled: selectedIndex >= 0
                            onClicked: addChild(selectedIndex)
                        }
                        CButton {
                            text: "Remove"
                            variant: "danger"
                            size: "sm"
                            enabled: selectedIndex > 0
                            onClicked: removeNode(selectedIndex)
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Type legend
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 6

                        Repeater {
                            model: [
                                { label: "container", color: "#5C6BC0" },
                                { label: "layout",    color: "#26A69A" },
                                { label: "widget",    color: "#FFA726" },
                                { label: "atom",      color: "#EF5350" }
                            ]
                            delegate: Row {
                                spacing: 4
                                Rectangle {
                                    width: 10; height: 10; radius: 2
                                    color: modelData.color
                                    anchors.verticalCenter: parent.verticalCenter
                                }
                                CText { variant: "caption"; text: modelData.label }
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    ListView {
                        id: treeList
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: treeNodes
                        clip: true
                        spacing: 2

                        delegate: Rectangle {
                            id: treeRow
                            width: treeList.width
                            height: 40
                            radius: 6
                            color: index === selectedIndex ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
                                                           : mouseArea.containsMouse ? Theme.surface : "transparent"

                            property var node: modelData

                            MouseArea {
                                id: mouseArea
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: selectedIndex = index
                            }

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12 + node.depth * 24
                                anchors.rightMargin: 12
                                spacing: 8

                                // Tree branch character
                                CText {
                                    visible: node.depth > 0
                                    variant: "caption"
                                    text: "\u251C\u2500"
                                    opacity: 0.4
                                }

                                // Type color indicator
                                Rectangle {
                                    width: 8; height: 8; radius: 4
                                    color: typeBadgeColor(node.type)
                                }

                                // Component name
                                CText {
                                    variant: index === selectedIndex ? "body1" : "body2"
                                    text: node.name
                                    Layout.fillWidth: true
                                }

                                // Visibility indicator
                                CText {
                                    variant: "caption"
                                    text: node.visible ? "\uD83D\uDC41" : "\u2014"
                                    opacity: node.visible ? 0.6 : 0.3
                                }

                                // Children count
                                CBadge {
                                    visible: childrenCount(index) > 0
                                    text: childrenCount(index).toString()
                                }
                            }
                        }
                    }
                }
            }

            // RIGHT PANEL - Properties
            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    CText { variant: "h4"; text: "Component Properties" }
                    CDivider { Layout.fillWidth: true }

                    // No selection state
                    Item {
                        visible: selectedIndex < 0 || selectedIndex >= treeNodes.length
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        CText {
                            anchors.centerIn: parent
                            variant: "body2"
                            text: "Select a component from the tree to view its properties."
                            opacity: 0.5
                        }
                    }

                    // Properties when selected
                    ColumnLayout {
                        visible: selectedIndex >= 0 && selectedIndex < treeNodes.length
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 14

                        property var sel: selectedIndex >= 0 && selectedIndex < treeNodes.length
                                          ? treeNodes[selectedIndex] : null

                        // Name field
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 4
                            CText { variant: "caption"; text: "NAME" }
                            CTextField {
                                id: nameField
                                Layout.fillWidth: true
                                text: parent.parent.sel ? parent.parent.sel.name : ""
                                onTextChanged: {
                                    if (selectedIndex >= 0 && selectedIndex < treeNodes.length && text !== treeNodes[selectedIndex].name) {
                                        var updated = treeNodes.slice()
                                        updated[selectedIndex] = Object.assign({}, updated[selectedIndex], { name: text })
                                        treeNodes = updated
                                        saveNode(selectedIndex)
                                    }
                                }
                            }
                        }

                        // Type selector row
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 4
                            CText { variant: "caption"; text: "TYPE" }
                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 6

                                Repeater {
                                    model: ["container", "layout", "widget", "atom"]
                                    delegate: CButton {
                                        text: modelData
                                        size: "sm"
                                        variant: (selectedIndex >= 0 && selectedIndex < treeNodes.length && treeNodes[selectedIndex].type === modelData) ? "primary" : "ghost"
                                        onClicked: {
                                            if (selectedIndex >= 0 && selectedIndex < treeNodes.length) {
                                                var updated = treeNodes.slice()
                                                updated[selectedIndex] = Object.assign({}, updated[selectedIndex], { type: modelData })
                                                treeNodes = updated
                                                saveNode(selectedIndex)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Visible toggle
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12
                            CText { variant: "body2"; text: "Visible" }
                            Item { Layout.fillWidth: true }
                            CSwitch {
                                checked: selectedIndex >= 0 && selectedIndex < treeNodes.length
                                         ? treeNodes[selectedIndex].visible : false
                                onCheckedChanged: {
                                    if (selectedIndex >= 0 && selectedIndex < treeNodes.length && checked !== treeNodes[selectedIndex].visible) {
                                        var updated = treeNodes.slice()
                                        updated[selectedIndex] = Object.assign({}, updated[selectedIndex], { visible: checked })
                                        treeNodes = updated
                                        saveNode(selectedIndex)
                                    }
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // Info row
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 16
                            ColumnLayout {
                                spacing: 2
                                CText { variant: "caption"; text: "DEPTH" }
                                CText {
                                    variant: "body1"
                                    text: selectedIndex >= 0 && selectedIndex < treeNodes.length
                                          ? treeNodes[selectedIndex].depth.toString() : "0"
                                }
                            }
                            ColumnLayout {
                                spacing: 2
                                CText { variant: "caption"; text: "CHILDREN" }
                                CText {
                                    variant: "body1"
                                    text: childrenCount(selectedIndex).toString()
                                }
                            }
                            ColumnLayout {
                                spacing: 2
                                CText { variant: "caption"; text: "NODE ID" }
                                CText {
                                    variant: "body1"
                                    text: selectedIndex >= 0 && selectedIndex < treeNodes.length
                                          ? treeNodes[selectedIndex].nodeId.toString() : "-"
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // Custom props
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8
                            CText { variant: "h4"; text: "Custom Properties" }
                            Item { Layout.fillWidth: true }
                            CButton {
                                text: "Add Prop"
                                variant: "ghost"
                                size: "sm"
                                onClicked: {
                                    if (selectedIndex >= 0 && selectedIndex < treeNodes.length) {
                                        var updated = treeNodes.slice()
                                        var node = Object.assign({}, updated[selectedIndex])
                                        var newProps = node.props.slice()
                                        newProps.push({ key: "newProp", value: "" })
                                        node.props = newProps
                                        updated[selectedIndex] = node
                                        treeNodes = updated
                                    }
                                }
                            }
                        }

                        ListView {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            clip: true
                            spacing: 6
                            model: selectedIndex >= 0 && selectedIndex < treeNodes.length
                                   ? treeNodes[selectedIndex].props : []

                            delegate: CPaper {
                                width: parent ? parent.width : 300
                                height: 44

                                RowLayout {
                                    anchors.fill: parent
                                    anchors.margins: 8
                                    spacing: 8

                                    CText {
                                        variant: "body2"
                                        text: modelData.key
                                        Layout.preferredWidth: 120
                                        opacity: 0.7
                                    }

                                    CText {
                                        variant: "body1"
                                        text: modelData.value
                                        Layout.fillWidth: true
                                    }

                                    CButton {
                                        text: "\u00D7"
                                        variant: "ghost"
                                        size: "sm"
                                        onClicked: {
                                            if (selectedIndex >= 0 && selectedIndex < treeNodes.length) {
                                                var updated = treeNodes.slice()
                                                var node = Object.assign({}, updated[selectedIndex])
                                                var newProps = node.props.slice()
                                                newProps.splice(index, 1)
                                                node.props = newProps
                                                updated[selectedIndex] = node
                                                treeNodes = updated
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
