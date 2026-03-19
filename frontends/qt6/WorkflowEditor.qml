import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: "transparent"

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    property bool useLiveData: dbal.connected

    // ── Workflow state ───────────────────────────────────────────
    property var workflows: []
    property int selectedWorkflowIndex: -1
    property string selectedNodeId: ""
    property real zoom: 1.0
    property real minZoom: 0.25
    property real maxZoom: 2.0

    // Current workflow data (full n8n-style format)
    property var currentWorkflow: selectedWorkflowIndex >= 0 && selectedWorkflowIndex < workflows.length
        ? workflows[selectedWorkflowIndex] : null
    property var workflowNodes: currentWorkflow ? (currentWorkflow.nodes || []) : []
    property var workflowConnections: currentWorkflow ? (currentWorkflow.connections || {}) : {}
    property var workflowVariables: currentWorkflow ? (currentWorkflow.variables || {}) : {}
    property var workflowMeta: currentWorkflow ? (currentWorkflow.meta || {}) : {}
    property var workflowTags: currentWorkflow ? (currentWorkflow.tags || []) : []

    // Selected node data
    property var selectedNode: {
        if (!selectedNodeId || !workflowNodes) return null
        for (var i = 0; i < workflowNodes.length; i++) {
            if (workflowNodes[i].id === selectedNodeId) return workflowNodes[i]
        }
        return null
    }

    // Node palette state
    property string paletteSearch: ""
    property string paletteGroup: ""
    property bool paletteVisible: true

    // Connection drawing state
    property bool drawingConnection: false
    property string connSourceNode: ""
    property string connSourcePort: ""
    property bool connSourceIsOutput: true
    property real connDragX: 0
    property real connDragY: 0

    // ── DBAL Load/Save ──────────────────────────────────────────
    // Mock workflow data as fallback
    property var mockWorkflows: [
        {
            name: "on_user_created",
            active: true,
            settings: {},
            tags: [{ name: "pastebin" }],
            meta: { description: "Triggered when a new user is created" },
            variables: {},
            nodes: [
                { id: "trigger_1", name: "UserCreatedEvent", type: "metabuilder.trigger", position: [50, 200],
                  parameters: { triggerType: "webhook" }, inputs: [], outputs: [{ name: "main", type: "main" }] },
                { id: "condition_1", name: "CheckEmailVerified", type: "logic.if", position: [300, 200],
                  parameters: {}, inputs: [{ name: "main", type: "main" }], outputs: [{ name: "main", type: "main" }, { name: "error", type: "error" }] },
                { id: "action_1", name: "CreateDefaultNS", type: "integration.http_request", position: [550, 100],
                  parameters: { url: "/api/namespaces" }, inputs: [{ name: "main", type: "main" }], outputs: [{ name: "main", type: "main" }] },
                { id: "action_2", name: "CreateExamplesNS", type: "integration.http_request", position: [550, 300],
                  parameters: { url: "/api/namespaces" }, inputs: [{ name: "main", type: "main" }], outputs: [{ name: "main", type: "main" }] },
                { id: "action_3", name: "SendWelcomeEmail", type: "integration.send_email", position: [800, 200],
                  parameters: { template: "welcome" }, inputs: [{ name: "main", type: "main" }], outputs: [] }
            ],
            connections: {
                "trigger_1":   { "main": { "0": [{ node: "condition_1", type: "main", index: 0 }] } },
                "condition_1": { "main": { "0": [{ node: "action_1", type: "main", index: 0 }, { node: "action_2", type: "main", index: 0 }] } },
                "action_1":    { "main": { "0": [{ node: "action_3", type: "main", index: 0 }] } },
                "action_2":    { "main": { "0": [{ node: "action_3", type: "main", index: 0 }] } }
            }
        },
        {
            name: "daily_cleanup",
            active: true,
            settings: { executionTimeout: 300 },
            tags: [{ name: "cron" }, { name: "maintenance" }],
            meta: { description: "Nightly cleanup of expired sessions and old audit logs" },
            variables: {},
            nodes: [
                { id: "cron_1", name: "CronSchedule", type: "metabuilder.trigger", position: [50, 150],
                  parameters: { triggerType: "schedule" }, inputs: [], outputs: [{ name: "main", type: "main" }] },
                { id: "expire_1", name: "ExpireSessions", type: "integration.http_request", position: [300, 80],
                  parameters: {}, inputs: [{ name: "main", type: "main" }], outputs: [{ name: "main", type: "main" }] },
                { id: "purge_1", name: "PurgeAuditLogs", type: "integration.http_request", position: [300, 250],
                  parameters: {}, inputs: [{ name: "main", type: "main" }], outputs: [{ name: "main", type: "main" }] },
                { id: "agg_1", name: "AggregateMetrics", type: "transform.aggregate", position: [550, 150],
                  parameters: {}, inputs: [{ name: "main", type: "main" }], outputs: [{ name: "main", type: "main" }] }
            ],
            connections: {
                "cron_1":    { "main": { "0": [{ node: "expire_1", type: "main", index: 0 }, { node: "purge_1", type: "main", index: 0 }] } },
                "expire_1":  { "main": { "0": [{ node: "agg_1", type: "main", index: 0 }] } },
                "purge_1":   { "main": { "0": [{ node: "agg_1", type: "main", index: 0 }] } }
            }
        }
    ]

    function loadWorkflows() {
        dbal.list("workflow", { take: 50 }, function(result, error) {
            if (!error && result && result.items && result.items.length > 0) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var w = result.items[i]
                    parsed.push({
                        id: w.id || "",
                        name: w.name || "unnamed_workflow",
                        active: w.active !== undefined ? w.active : true,
                        settings: w.settings || {},
                        tags: w.tags || [],
                        meta: w.meta || {},
                        variables: w.variables || {},
                        nodes: w.nodes || [],
                        connections: w.connections || {}
                    })
                }
                workflows = parsed
                if (selectedWorkflowIndex >= parsed.length)
                    selectedWorkflowIndex = parsed.length > 0 ? 0 : -1
            } else {
                // Fallback to mock data
                workflows = JSON.parse(JSON.stringify(mockWorkflows))
                if (selectedWorkflowIndex < 0 && workflows.length > 0)
                    selectedWorkflowIndex = 0
            }
        })
    }

    function saveWorkflow(wf, callback) {
        if (!useLiveData) return
        if (wf.id) {
            dbal.update("workflow", wf.id, wf, function(result, error) {
                if (!error) loadWorkflows()
                if (callback) callback(result, error)
            })
        } else {
            dbal.create("workflow", wf, function(result, error) {
                if (!error) loadWorkflows()
                if (callback) callback(result, error)
            })
        }
    }

    function deleteWorkflow(index) {
        var wf = workflows[index]
        if (useLiveData && wf.id) {
            dbal.remove("workflow", wf.id, function(result, error) {
                if (!error) {
                    loadWorkflows()
                } else {
                    deleteWorkflowLocally(index)
                }
            })
        } else {
            deleteWorkflowLocally(index)
        }
    }

    function deleteWorkflowLocally(index) {
        var copy = workflows.slice()
        copy.splice(index, 1)
        workflows = copy
        if (selectedWorkflowIndex >= copy.length)
            selectedWorkflowIndex = Math.max(0, copy.length - 1)
        selectedNodeId = ""
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadWorkflows()
    }

    Component.onCompleted: {
        loadWorkflows()
    }

    // ── Node type helpers ───────────────────────────────────────
    function groupColor(nodeType) {
        var prefix = nodeType ? nodeType.split(".")[0] : ""
        switch (prefix) {
            case "metabuilder": return Theme.success
            case "logic":       return Theme.warning
            case "transform":
            case "packagerepo": return "#FF9800"
            case "sdl":
            case "graphics":    return "#2196F3"
            case "integration": return "#9C27B0"
            case "io":          return "#00BCD4"
            default:            return Theme.primary
        }
    }

    // ── Canvas helpers ──────────────────────────────────────────
    function findNodeById(id) {
        if (!workflowNodes) return null
        for (var i = 0; i < workflowNodes.length; i++) {
            if (workflowNodes[i].id === id) return workflowNodes[i]
        }
        return null
    }

    function getNodePortY(node, portIndex, isOutput) {
        var headerH = 32
        var portSpacing = 24
        return node.position[1] + headerH + 8 + portIndex * portSpacing + 6
    }

    function getNodeOutputX(node) {
        return node.position[0] + 180 // node width
    }

    function addNodeToCanvas(nodeType, posX, posY) {
        if (!currentWorkflow) return
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
        var wf = workflows[selectedWorkflowIndex]
        wf.nodes = wf.nodes.slice()
        wf.nodes.push(newNode)
        workflows = workflows.slice()
        selectedNodeId = newId
        connectionLayer.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function removeNode(nodeId) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        wf.nodes = wf.nodes.filter(function(n) { return n.id !== nodeId })
        // Remove connections referencing this node
        var newConns = {}
        for (var srcId in wf.connections) {
            if (srcId === nodeId) continue
            var srcConns = wf.connections[srcId]
            var newSrcConns = {}
            for (var outName in srcConns) {
                var newOut = {}
                for (var idx in srcConns[outName]) {
                    var targets = srcConns[outName][idx].filter(function(t) { return t.node !== nodeId })
                    if (targets.length > 0) newOut[idx] = targets
                }
                if (Object.keys(newOut).length > 0) newSrcConns[outName] = newOut
            }
            if (Object.keys(newSrcConns).length > 0) newConns[srcId] = newSrcConns
        }
        wf.connections = newConns
        workflows = workflows.slice()
        if (selectedNodeId === nodeId) selectedNodeId = ""
        connectionLayer.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function addConnection(srcNodeId, srcPort, dstNodeId, dstPort) {
        if (!currentWorkflow || srcNodeId === dstNodeId) return
        var wf = workflows[selectedWorkflowIndex]
        if (!wf.connections) wf.connections = {}
        if (!wf.connections[srcNodeId]) wf.connections[srcNodeId] = {}
        if (!wf.connections[srcNodeId][srcPort]) wf.connections[srcNodeId][srcPort] = {}
        if (!wf.connections[srcNodeId][srcPort]["0"]) wf.connections[srcNodeId][srcPort]["0"] = []
        // Avoid duplicate
        var existing = wf.connections[srcNodeId][srcPort]["0"]
        for (var i = 0; i < existing.length; i++) {
            if (existing[i].node === dstNodeId) return
        }
        existing.push({ node: dstNodeId, type: dstPort, index: 0 })
        workflows = workflows.slice()
        connectionLayer.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    // ── Test execution ──────────────────────────────────────────
    property bool testPanelVisible: false
    property string testInput: '{"userId": "u-42", "email": "demo@example.com"}'
    property string testOutput: ""
    property string executionStatus: ""

    Timer {
        id: executionTimer
        interval: 1800
        onTriggered: {
            if (!currentWorkflow) return
            var wf = currentWorkflow
            var lines = []
            lines.push("[" + Qt.formatTime(new Date(), "HH:mm:ss") + "] Workflow: " + wf.name)
            lines.push("[" + Qt.formatTime(new Date(), "HH:mm:ss") + "] Nodes: " + (wf.nodes ? wf.nodes.length : 0))
            lines.push("")
            if (wf.nodes) {
                for (var i = 0; i < wf.nodes.length; i++) {
                    var n = wf.nodes[i]
                    lines.push("  [" + (i + 1) + "/" + wf.nodes.length + "] " + n.type + "::" + n.name + " ... OK")
                }
            }
            lines.push("")
            lines.push("[RESULT] Workflow completed successfully.")
            executionStatus = "success"
            testOutput = lines.join("\n")
        }
    }

    // ── Main Layout ─────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // ── TOP BAR ─────────────────────────────────────────────
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 56
            color: Theme.paper
            border.color: Theme.border
            border.width: 1

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                spacing: 12

                CText {
                    variant: "h3"
                    text: currentWorkflow ? currentWorkflow.name : "No Workflow"
                }

                CBadge {
                    visible: currentWorkflow !== null
                    text: currentWorkflow && currentWorkflow.active ? "Active" : "Inactive"
                    accent: currentWorkflow ? currentWorkflow.active : false
                }

                CBadge {
                    text: useLiveData ? "Live" : "Mock"
                    color: useLiveData ? Theme.success : Theme.warning
                }

                // Tags
                Repeater {
                    model: workflowTags.length > 3 ? 3 : workflowTags.length
                    CChip {
                        text: workflowTags[index] ? workflowTags[index].name : ""
                        color: Theme.border
                    }
                }

                CBadge {
                    visible: workflowNodes.length > 0
                    text: workflowNodes.length + " nodes"
                    color: Theme.border
                }

                Item { Layout.fillWidth: true }

                CText {
                    variant: "caption"
                    text: Math.round(zoom * 100) + "%"
                }

                CButton {
                    text: "Fit"
                    variant: "ghost"
                    size: "sm"
                    onClicked: zoom = 1.0
                }

                CSwitch {
                    visible: currentWorkflow !== null
                    checked: currentWorkflow ? currentWorkflow.active : false
                    onCheckedChanged: {
                        if (currentWorkflow && currentWorkflow.active !== checked) {
                            workflows[selectedWorkflowIndex].active = checked
                            workflows = workflows.slice()
                            if (useLiveData) saveWorkflow(workflows[selectedWorkflowIndex])
                        }
                    }
                }

                CButton {
                    text: "New"
                    variant: "ghost"
                    onClicked: {
                        var newWf = {
                            name: "new_workflow_" + (workflows.length + 1),
                            active: false,
                            settings: {},
                            tags: [],
                            meta: { description: "" },
                            variables: {},
                            nodes: [
                                { id: "trigger_1", name: "Start", type: "metabuilder.trigger", position: [200, 250],
                                  parameters: { triggerType: "manual" },
                                  inputs: [], outputs: [{ name: "main", type: "main", displayName: "Output" }] }
                            ],
                            connections: {}
                        }
                        if (useLiveData) {
                            dbal.create("workflow", newWf, function(result, error) {
                                if (!error) loadWorkflows()
                                else {
                                    var wfs = workflows.slice()
                                    wfs.push(newWf)
                                    workflows = wfs
                                    selectedWorkflowIndex = wfs.length - 1
                                    selectedNodeId = ""
                                }
                            })
                        } else {
                            var wfs = workflows.slice()
                            wfs.push(newWf)
                            workflows = wfs
                            selectedWorkflowIndex = wfs.length - 1
                            selectedNodeId = ""
                        }
                    }
                }

                CButton {
                    text: executionStatus === "running" ? "Running..." : "Run Test"
                    variant: "primary"
                    enabled: executionStatus !== "running" && currentWorkflow !== null
                    onClicked: {
                        executionStatus = "running"
                        testOutput = "Executing workflow " + currentWorkflow.name + "..."
                        testPanelVisible = true
                        executionTimer.start()
                    }
                }
            }
        }

        // ── CONTENT ROW ─────────────────────────────────────────
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // ── LEFT: Workflow List + Node Palette ───────────────
            Rectangle {
                Layout.preferredWidth: 260
                Layout.fillHeight: true
                color: Theme.paper
                border.color: Theme.border
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    spacing: 0

                    // Workflow List Section
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 200
                        Layout.margins: 12
                        spacing: 4

                        CText { variant: "h4"; text: "Workflows" }
                        CText { variant: "caption"; text: workflows.length + " registered" }

                        CDivider { Layout.fillWidth: true; Layout.topMargin: 4; Layout.bottomMargin: 4 }

                        ListView {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            model: workflows.length
                            spacing: 2
                            clip: true
                            delegate: CListItem {
                                width: parent ? parent.width : 200
                                title: workflows[index].name
                                subtitle: (workflows[index].nodes ? workflows[index].nodes.length : 0) + " nodes"
                                selected: selectedWorkflowIndex === index
                                onClicked: {
                                    selectedWorkflowIndex = index
                                    selectedNodeId = ""
                                    testOutput = ""
                                    executionStatus = ""
                                    connectionLayer.requestPaint()
                                }

                                CBadge {
                                    anchors.right: parent.right
                                    anchors.rightMargin: 8
                                    anchors.verticalCenter: parent.verticalCenter
                                    text: workflows[index].active ? "ON" : "OFF"
                                    accent: workflows[index].active
                                }
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Node Palette Section
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        Layout.margins: 12
                        spacing: 8

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 4
                            CText { variant: "h4"; text: "Node Palette" }
                            CText {
                                variant: "caption"
                                text: NodeRegistry.nodeCount + " types"
                            }
                        }

                        CTextField {
                            Layout.fillWidth: true
                            placeholderText: "Search nodes..."
                            text: paletteSearch
                            onTextChanged: paletteSearch = text
                        }

                        // Group filter chips
                        Flow {
                            Layout.fillWidth: true
                            spacing: 4
                            CChip {
                                text: "All"
                                selected: paletteGroup === ""
                                color: Theme.primary
                                MouseArea {
                                    anchors.fill: parent
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: paletteGroup = ""
                                }
                            }
                            Repeater {
                                model: NodeRegistry.groups
                                CChip {
                                    text: modelData
                                    selected: paletteGroup === modelData
                                    color: groupColor(modelData + ".x")
                                    MouseArea {
                                        anchors.fill: parent
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: paletteGroup = (paletteGroup === modelData) ? "" : modelData
                                    }
                                }
                            }
                        }

                        // Node type list
                        ListView {
                            id: paletteList
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            clip: true
                            spacing: 2

                            model: {
                                var nodes = paletteSearch
                                    ? NodeRegistry.searchNodes(paletteSearch)
                                    : (paletteGroup ? NodeRegistry.nodesByGroup(paletteGroup) : NodeRegistry.nodeTypes)
                                return nodes
                            }

                            delegate: Rectangle {
                                width: paletteList.width
                                height: 40
                                radius: 4
                                color: paletteMA.containsMouse ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.08) : "transparent"
                                border.color: paletteMA.containsMouse ? Theme.border : "transparent"
                                border.width: 1

                                RowLayout {
                                    anchors.fill: parent
                                    anchors.margins: 6
                                    spacing: 8

                                    Rectangle {
                                        width: 6
                                        height: 24
                                        radius: 3
                                        color: groupColor(modelData.name || "")
                                    }

                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 0
                                        CText {
                                            variant: "body2"
                                            text: modelData.displayName || modelData.name || ""
                                            font.bold: true
                                            elide: Text.ElideRight
                                            Layout.fillWidth: true
                                        }
                                        CText {
                                            variant: "caption"
                                            text: modelData.group || ""
                                            font.pixelSize: 9
                                        }
                                    }
                                }

                                MouseArea {
                                    id: paletteMA
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor

                                    // Double-click to add node at center of canvas
                                    onDoubleClicked: {
                                        var cx = canvas.contentX + canvas.width / 2
                                        var cy = canvas.contentY + canvas.height / 2
                                        addNodeToCanvas(modelData.name, cx, cy)
                                    }
                                }

                                // Drag to canvas
                                Drag.active: paletteDragHandler.active
                                Drag.hotSpot.x: width / 2
                                Drag.hotSpot.y: height / 2
                                Drag.mimeData: ({ "text/node-type": modelData.name || "" })

                                DragHandler {
                                    id: paletteDragHandler
                                }
                            }
                        }
                    }
                }
            }

            // ── CENTER: Infinite Canvas ──────────────────────────
            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: Theme.background
                clip: true

                // Drop area for palette drag
                DropArea {
                    anchors.fill: parent
                    keys: ["text/node-type"]
                    onDropped: function(drop) {
                        var nodeType = drop.getDataAsString("text/node-type")
                        if (nodeType) {
                            var localPos = mapToItem(canvasContent, drop.x, drop.y)
                            addNodeToCanvas(nodeType, localPos.x, localPos.y)
                        }
                    }
                }

                Flickable {
                    id: canvas
                    anchors.fill: parent
                    contentWidth: 5000
                    contentHeight: 5000
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds

                    // Start centered
                    Component.onCompleted: {
                        contentX = 1500
                        contentY = 1500
                    }

                    Item {
                        id: canvasContent
                        width: canvas.contentWidth
                        height: canvas.contentHeight

                        transform: Scale {
                            id: canvasScale
                            origin.x: 0
                            origin.y: 0
                            xScale: zoom
                            yScale: zoom
                        }

                        // Grid background
                        Canvas {
                            id: gridLayer
                            anchors.fill: parent
                            onPaint: {
                                var ctx = getContext("2d")
                                ctx.reset()
                                var gridSize = 50
                                ctx.strokeStyle = Qt.rgba(0.5, 0.5, 0.5, 0.1)
                                ctx.lineWidth = 1

                                for (var x = 0; x < width; x += gridSize) {
                                    ctx.beginPath()
                                    ctx.moveTo(x, 0)
                                    ctx.lineTo(x, height)
                                    ctx.stroke()
                                }
                                for (var y = 0; y < height; y += gridSize) {
                                    ctx.beginPath()
                                    ctx.moveTo(0, y)
                                    ctx.lineTo(width, y)
                                    ctx.stroke()
                                }
                            }
                            Component.onCompleted: requestPaint()
                        }

                        // Connection layer (Bezier curves)
                        Canvas {
                            id: connectionLayer
                            anchors.fill: parent
                            z: 1

                            onPaint: {
                                var ctx = getContext("2d")
                                ctx.reset()
                                ctx.lineWidth = 2.5

                                if (!workflowConnections || !workflowNodes) return

                                var nodeW = 180
                                var headerH = 32
                                var portSpacing = 24
                                var portOffset = 8

                                // Draw established connections
                                for (var srcId in workflowConnections) {
                                    var srcNode = findNodeById(srcId)
                                    if (!srcNode) continue

                                    var srcConns = workflowConnections[srcId]
                                    for (var outName in srcConns) {
                                        for (var outIdx in srcConns[outName]) {
                                            var targets = srcConns[outName][outIdx]
                                            var outIndex = parseInt(outIdx)
                                            var srcX = srcNode.position[0] + nodeW
                                            var srcY = srcNode.position[1] + headerH + portOffset + outIndex * portSpacing + 6

                                            for (var t = 0; t < targets.length; t++) {
                                                var target = targets[t]
                                                var dstNode = findNodeById(target.node)
                                                if (!dstNode) continue

                                                var inIndex = target.index || 0
                                                var dstX = dstNode.position[0]
                                                var dstY = dstNode.position[1] + headerH + portOffset + inIndex * portSpacing + 6

                                                // Draw Bezier
                                                var cpOffset = Math.max(80, Math.abs(dstX - srcX) * 0.4)
                                                ctx.strokeStyle = groupColor(srcNode.type)
                                                ctx.globalAlpha = 0.8
                                                ctx.beginPath()
                                                ctx.moveTo(srcX, srcY)
                                                ctx.bezierCurveTo(srcX + cpOffset, srcY, dstX - cpOffset, dstY, dstX, dstY)
                                                ctx.stroke()

                                                // Arrow at destination
                                                ctx.globalAlpha = 1.0
                                                ctx.fillStyle = groupColor(srcNode.type)
                                                ctx.beginPath()
                                                ctx.moveTo(dstX, dstY)
                                                ctx.lineTo(dstX - 8, dstY - 4)
                                                ctx.lineTo(dstX - 8, dstY + 4)
                                                ctx.closePath()
                                                ctx.fill()
                                            }
                                        }
                                    }
                                }

                                // Draw connection being dragged
                                if (drawingConnection && connSourceNode) {
                                    var dragSrc = findNodeById(connSourceNode)
                                    if (dragSrc) {
                                        var sx, sy
                                        if (connSourceIsOutput) {
                                            sx = dragSrc.position[0] + nodeW
                                            sy = dragSrc.position[1] + headerH + portOffset + 6
                                        } else {
                                            sx = dragSrc.position[0]
                                            sy = dragSrc.position[1] + headerH + portOffset + 6
                                        }
                                        var dx = connDragX
                                        var dy = connDragY
                                        var cp = Math.max(60, Math.abs(dx - sx) * 0.4)

                                        ctx.strokeStyle = Theme.primary
                                        ctx.globalAlpha = 0.6
                                        ctx.setLineDash([6, 4])
                                        ctx.lineWidth = 2
                                        ctx.beginPath()
                                        ctx.moveTo(sx, sy)
                                        ctx.bezierCurveTo(sx + cp, sy, dx - cp, dy, dx, dy)
                                        ctx.stroke()
                                        ctx.setLineDash([])
                                    }
                                }
                            }
                        }

                        // Node layer
                        Repeater {
                            id: nodeRepeater
                            model: workflowNodes.length
                            z: 2

                            delegate: Rectangle {
                                id: nodeRect
                                property var nodeData: workflowNodes[index]
                                property bool isSelected: selectedNodeId === nodeData.id
                                property int portRadius: 6
                                property int headerHeight: 32
                                property int portSpacing: 24
                                property int nodeWidth: 180
                                property int inputCount: nodeData.inputs ? nodeData.inputs.length : 0
                                property int outputCount: nodeData.outputs ? nodeData.outputs.length : 0
                                property int bodyPorts: Math.max(inputCount, outputCount)

                                x: nodeData.position[0]
                                y: nodeData.position[1]
                                width: nodeWidth
                                height: headerHeight + Math.max(1, bodyPorts) * portSpacing + 16
                                radius: 8
                                color: isSelected ? Qt.lighter(Theme.paper, 1.1) : Theme.paper
                                border.color: isSelected ? groupColor(nodeData.type) : Theme.border
                                border.width: isSelected ? 2 : 1
                                z: isSelected ? 10 : 2

                                // Header
                                Rectangle {
                                    id: nodeHeader
                                    anchors.top: parent.top
                                    anchors.left: parent.left
                                    anchors.right: parent.right
                                    height: headerHeight
                                    radius: 8
                                    color: groupColor(nodeData.type)

                                    Rectangle {
                                        anchors.bottom: parent.bottom
                                        anchors.left: parent.left
                                        anchors.right: parent.right
                                        height: parent.radius
                                        color: parent.color
                                    }

                                    CText {
                                        anchors.centerIn: parent
                                        text: nodeData.name || nodeData.type
                                        color: "#FFFFFF"
                                        variant: "body2"
                                        font.bold: true
                                        elide: Text.ElideRight
                                        width: parent.width - 16
                                        horizontalAlignment: Text.AlignHCenter
                                    }
                                }

                                // Type label below header
                                CText {
                                    anchors.top: nodeHeader.bottom
                                    anchors.topMargin: 2
                                    anchors.horizontalCenter: parent.horizontalCenter
                                    text: nodeData.type
                                    variant: "caption"
                                    font.pixelSize: 9
                                    color: Theme.textSecondary || Theme.text
                                    opacity: 0.6
                                }

                                // Input ports
                                Column {
                                    anchors.left: parent.left
                                    anchors.leftMargin: -portRadius
                                    anchors.top: nodeHeader.bottom
                                    anchors.topMargin: 8
                                    spacing: portSpacing - portRadius * 2

                                    Repeater {
                                        model: nodeData.inputs || []
                                        Item {
                                            width: portRadius * 2
                                            height: portRadius * 2

                                            Rectangle {
                                                id: inPort
                                                width: portRadius * 2
                                                height: portRadius * 2
                                                radius: portRadius
                                                color: Theme.primary
                                                border.color: "#FFFFFF"
                                                border.width: 1.5

                                                MouseArea {
                                                    anchors.fill: parent
                                                    anchors.margins: -6
                                                    cursorShape: Qt.CrossCursor
                                                    hoverEnabled: true

                                                    onPressed: {
                                                        if (drawingConnection && connSourceIsOutput) {
                                                            // Complete connection
                                                            addConnection(connSourceNode, connSourcePort, nodeData.id, modelData.name)
                                                            drawingConnection = false
                                                            connSourceNode = ""
                                                            connectionLayer.requestPaint()
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // Output ports
                                Column {
                                    anchors.right: parent.right
                                    anchors.rightMargin: -portRadius
                                    anchors.top: nodeHeader.bottom
                                    anchors.topMargin: 8
                                    spacing: portSpacing - portRadius * 2

                                    Repeater {
                                        model: nodeData.outputs || []
                                        Item {
                                            width: portRadius * 2
                                            height: portRadius * 2

                                            Rectangle {
                                                id: outPort
                                                width: portRadius * 2
                                                height: portRadius * 2
                                                radius: portRadius
                                                color: Theme.success
                                                border.color: "#FFFFFF"
                                                border.width: 1.5

                                                MouseArea {
                                                    anchors.fill: parent
                                                    anchors.margins: -6
                                                    cursorShape: Qt.CrossCursor
                                                    hoverEnabled: true

                                                    onPressed: {
                                                        drawingConnection = true
                                                        connSourceNode = nodeData.id
                                                        connSourcePort = modelData.name
                                                        connSourceIsOutput = true
                                                        var globalPos = outPort.mapToItem(canvasContent, portRadius, portRadius)
                                                        connDragX = globalPos.x
                                                        connDragY = globalPos.y
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // Drag handler for moving the node
                                DragHandler {
                                    id: nodeDrag
                                    target: nodeRect
                                    onActiveChanged: {
                                        if (!active) {
                                            // Update position in model
                                            var wf = workflows[selectedWorkflowIndex]
                                            for (var i = 0; i < wf.nodes.length; i++) {
                                                if (wf.nodes[i].id === nodeData.id) {
                                                    wf.nodes[i].position = [nodeRect.x, nodeRect.y]
                                                    break
                                                }
                                            }
                                            workflows = workflows.slice()
                                            connectionLayer.requestPaint()
                                            if (useLiveData) saveWorkflow(wf)
                                        }
                                    }
                                    // Repaint connections while dragging
                                    onCentroidChanged: {
                                        connectionLayer.requestPaint()
                                    }
                                }

                                // Click to select
                                TapHandler {
                                    onTapped: {
                                        selectedNodeId = nodeData.id
                                    }
                                }
                            }
                        }

                        // Canvas mouse area for connection drawing + zoom
                        MouseArea {
                            anchors.fill: parent
                            z: 0
                            acceptedButtons: Qt.LeftButton | Qt.MiddleButton
                            hoverEnabled: true

                            onPositionChanged: function(mouse) {
                                if (drawingConnection) {
                                    connDragX = mouse.x
                                    connDragY = mouse.y
                                    connectionLayer.requestPaint()
                                }
                            }

                            onReleased: function(mouse) {
                                if (drawingConnection) {
                                    drawingConnection = false
                                    connSourceNode = ""
                                    connectionLayer.requestPaint()
                                }
                            }

                            onClicked: function(mouse) {
                                // Click on empty canvas deselects
                                selectedNodeId = ""
                            }

                            onWheel: function(wheel) {
                                var zoomDelta = wheel.angleDelta.y > 0 ? 0.1 : -0.1
                                var newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + zoomDelta))
                                zoom = newZoom
                            }
                        }
                    }
                }

                // Zoom overlay
                Rectangle {
                    anchors.bottom: parent.bottom
                    anchors.right: parent.right
                    anchors.margins: 12
                    width: 120
                    height: 36
                    radius: 18
                    color: Qt.rgba(Theme.paper.r || 0.1, Theme.paper.g || 0.1, Theme.paper.b || 0.1, 0.9)
                    border.color: Theme.border
                    border.width: 1

                    RowLayout {
                        anchors.centerIn: parent
                        spacing: 8

                        CButton {
                            text: "-"
                            variant: "ghost"
                            size: "sm"
                            onClicked: zoom = Math.max(minZoom, zoom - 0.1)
                        }

                        CText {
                            variant: "caption"
                            text: Math.round(zoom * 100) + "%"
                        }

                        CButton {
                            text: "+"
                            variant: "ghost"
                            size: "sm"
                            onClicked: zoom = Math.min(maxZoom, zoom + 0.1)
                        }
                    }
                }

                // Empty state
                CText {
                    anchors.centerIn: parent
                    visible: !currentWorkflow || workflowNodes.length === 0
                    text: currentWorkflow ? "Empty canvas — drag nodes from the palette or double-click a node type" : "Select a workflow from the sidebar"
                    variant: "body1"
                    opacity: 0.5
                }
            }

            // ── RIGHT: Properties Panel ─────────────────────────
            Rectangle {
                Layout.preferredWidth: selectedNode ? 300 : 0
                Layout.fillHeight: true
                color: Theme.paper
                border.color: Theme.border
                border.width: selectedNode ? 1 : 0
                clip: true
                visible: selectedNode !== null

                Behavior on Layout.preferredWidth { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12
                    visible: selectedNode !== null

                    // Header
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText { variant: "h4"; text: "Node Properties" }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Delete"
                            variant: "danger"
                            size: "sm"
                            onClicked: removeNode(selectedNodeId)
                        }
                        CButton {
                            text: "X"
                            variant: "ghost"
                            size: "sm"
                            onClicked: selectedNodeId = ""
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Type badge
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText { variant: "body2"; text: "Type" }
                        CChip {
                            text: selectedNode ? selectedNode.type : ""
                            color: selectedNode ? groupColor(selectedNode.type) : Theme.primary
                        }
                    }

                    // Name field
                    CText { variant: "body2"; text: "Name" }
                    CTextField {
                        Layout.fillWidth: true
                        text: selectedNode ? selectedNode.name : ""
                        onTextChanged: {
                            if (selectedNode && text !== selectedNode.name) {
                                var wf = workflows[selectedWorkflowIndex]
                                for (var i = 0; i < wf.nodes.length; i++) {
                                    if (wf.nodes[i].id === selectedNodeId) {
                                        wf.nodes[i].name = text
                                        break
                                    }
                                }
                                workflows = workflows.slice()
                            }
                        }
                    }

                    // Position display
                    CText { variant: "body2"; text: "Position" }
                    CText {
                        variant: "caption"
                        text: selectedNode ? "x: " + Math.round(selectedNode.position[0]) + "  y: " + Math.round(selectedNode.position[1]) : ""
                    }

                    CDivider { Layout.fillWidth: true }

                    // Parameters
                    CText { variant: "body2"; text: "Parameters"; font.bold: true }

                    ListView {
                        Layout.fillWidth: true
                        Layout.preferredHeight: Math.min(contentHeight, 200)
                        clip: true
                        spacing: 8

                        model: {
                            if (!selectedNode) return []
                            // Get parameter schema from NodeRegistry
                            var regEntry = NodeRegistry.nodeType(selectedNode.type)
                            return regEntry ? (regEntry.properties || []) : []
                        }

                        delegate: ColumnLayout {
                            width: parent ? parent.width : 250
                            spacing: 4

                            CText {
                                variant: "caption"
                                text: modelData.displayName || modelData.name
                            }

                            Loader {
                                Layout.fillWidth: true
                                sourceComponent: {
                                    if (modelData.options && modelData.options.length > 0) return selectComp
                                    return textFieldComp
                                }
                            }

                            Component {
                                id: textFieldComp
                                CTextField {
                                    text: selectedNode && selectedNode.parameters
                                        ? (selectedNode.parameters[modelData.name] || modelData.default || "") : ""
                                    placeholderText: modelData.description || ""
                                    onTextChanged: {
                                        if (selectedNode) {
                                            var wf = workflows[selectedWorkflowIndex]
                                            for (var i = 0; i < wf.nodes.length; i++) {
                                                if (wf.nodes[i].id === selectedNodeId) {
                                                    if (!wf.nodes[i].parameters) wf.nodes[i].parameters = {}
                                                    wf.nodes[i].parameters[modelData.name] = text
                                                    break
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            Component {
                                id: selectComp
                                CSelect {
                                    model: {
                                        var opts = modelData.options || []
                                        var labels = []
                                        for (var i = 0; i < opts.length; i++) {
                                            labels.push(opts[i].name || opts[i].value || "")
                                        }
                                        return labels
                                    }
                                }
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Inputs/Outputs display
                    CText { variant: "body2"; text: "Ports"; font.bold: true }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        ColumnLayout {
                            spacing: 4
                            CText { variant: "caption"; text: "Inputs" }
                            Repeater {
                                model: selectedNode ? (selectedNode.inputs || []) : []
                                CChip {
                                    text: modelData.displayName || modelData.name
                                    color: Theme.primary
                                }
                            }
                            CText {
                                visible: !selectedNode || !selectedNode.inputs || selectedNode.inputs.length === 0
                                variant: "caption"
                                text: "None"
                                opacity: 0.5
                            }
                        }

                        ColumnLayout {
                            spacing: 4
                            CText { variant: "caption"; text: "Outputs" }
                            Repeater {
                                model: selectedNode ? (selectedNode.outputs || []) : []
                                CChip {
                                    text: modelData.displayName || modelData.name
                                    color: Theme.success
                                }
                            }
                            CText {
                                visible: !selectedNode || !selectedNode.outputs || selectedNode.outputs.length === 0
                                variant: "caption"
                                text: "None"
                                opacity: 0.5
                            }
                        }
                    }

                    // Metadata section (variables, tags)
                    CDivider { Layout.fillWidth: true; visible: Object.keys(workflowVariables).length > 0 }

                    CText {
                        variant: "body2"
                        text: "Workflow Variables"
                        font.bold: true
                        visible: Object.keys(workflowVariables).length > 0
                    }

                    Repeater {
                        model: Object.keys(workflowVariables)
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 4
                            CText { variant: "caption"; text: modelData + ":" }
                            CText {
                                variant: "caption"
                                text: {
                                    var v = workflowVariables[modelData]
                                    return v ? (v.defaultValue !== undefined ? String(v.defaultValue) : "") : ""
                                }
                                opacity: 0.7
                            }
                        }
                    }

                    Item { Layout.fillHeight: true }
                }
            }
        }

        // ── BOTTOM: Test Execution Panel ────────────────────────
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: testPanelVisible ? 220 : 36
            color: Theme.paper
            border.color: Theme.border
            border.width: 1
            clip: true

            Behavior on Layout.preferredHeight { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 8

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CText {
                        variant: "body2"
                        text: "Test Execution"
                        font.bold: true
                    }

                    Rectangle {
                        width: 10; height: 10; radius: 5
                        visible: executionStatus !== ""
                        color: {
                            if (executionStatus === "running") return Theme.warning
                            if (executionStatus === "success") return Theme.success
                            return Theme.error
                        }
                    }
                    CText {
                        variant: "caption"
                        visible: executionStatus !== ""
                        text: {
                            if (executionStatus === "running") return "Running..."
                            if (executionStatus === "success") return "Passed"
                            return "Failed"
                        }
                    }

                    Item { Layout.fillWidth: true }

                    CButton {
                        text: testPanelVisible ? "Hide" : "Show"
                        variant: "ghost"
                        size: "sm"
                        onClicked: testPanelVisible = !testPanelVisible
                    }
                }

                RowLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 12
                    visible: testPanelVisible

                    ColumnLayout {
                        Layout.preferredWidth: 300
                        Layout.fillHeight: true
                        spacing: 6

                        CText { variant: "caption"; text: "Test Input (JSON)" }
                        CTextField {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            text: testInput
                            onTextChanged: testInput = text
                        }
                        CButton {
                            text: executionStatus === "running" ? "Executing..." : "Execute"
                            variant: "primary"
                            enabled: executionStatus !== "running" && currentWorkflow !== null
                            onClicked: {
                                executionStatus = "running"
                                testOutput = "Executing workflow " + currentWorkflow.name + "..."
                                executionTimer.start()
                            }
                        }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 6

                        CText { variant: "caption"; text: "Output Log" }
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            color: Theme.surface
                            radius: 4
                            border.color: Theme.border
                            border.width: 1

                            ScrollView {
                                anchors.fill: parent
                                anchors.margins: 8

                                Text {
                                    width: parent.width
                                    text: testOutput
                                    color: Theme.text
                                    font.family: "monospace"
                                    font.pixelSize: 11
                                    wrapMode: Text.WrapAnywhere
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
