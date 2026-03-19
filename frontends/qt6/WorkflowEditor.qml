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

    // Connection drawing state (orchestrator owns this)
    property bool drawingConnection: false
    property string connSourceNode: ""
    property string connSourcePort: ""
    property bool connSourceIsOutput: true
    property real connDragX: 0
    property real connDragY: 0

    // ── Mock data (loaded from JSON) ─────────────────────────────
    property var mockWorkflows: []

    function loadMockData() {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200 || xhr.status === 0) {
                    try {
                        mockWorkflows = JSON.parse(xhr.responseText)
                    } catch (e) {
                        console.warn("WorkflowEditor: failed to parse mock data:", e)
                        mockWorkflows = []
                    }
                }
                loadWorkflows()
            }
        }
        xhr.open("GET", Qt.resolvedUrl("config/workflow-mock-data.json"))
        xhr.send()
    }

    // ── DBAL Load/Save ──────────────────────────────────────────
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

    // ── Node/Connection mutation helpers ─────────────────────────
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
        workflowCanvas.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function removeNode(nodeId) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        wf.nodes = wf.nodes.filter(function(n) { return n.id !== nodeId })
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
        workflowCanvas.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function addConnection(srcNodeId, srcPort, dstNodeId, dstPort) {
        if (!currentWorkflow || srcNodeId === dstNodeId) return
        var wf = workflows[selectedWorkflowIndex]
        if (!wf.connections) wf.connections = {}
        if (!wf.connections[srcNodeId]) wf.connections[srcNodeId] = {}
        if (!wf.connections[srcNodeId][srcPort]) wf.connections[srcNodeId][srcPort] = {}
        if (!wf.connections[srcNodeId][srcPort]["0"]) wf.connections[srcNodeId][srcPort]["0"] = []
        var existing = wf.connections[srcNodeId][srcPort]["0"]
        for (var i = 0; i < existing.length; i++) {
            if (existing[i].node === dstNodeId) return
        }
        existing.push({ node: dstNodeId, type: dstPort, index: 0 })
        workflows = workflows.slice()
        workflowCanvas.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function updateNodeName(name) {
        if (!selectedNode) return
        var wf = workflows[selectedWorkflowIndex]
        for (var i = 0; i < wf.nodes.length; i++) {
            if (wf.nodes[i].id === selectedNodeId) {
                wf.nodes[i].name = name
                break
            }
        }
        workflows = workflows.slice()
    }

    function updateNodeParameter(key, value) {
        if (!selectedNode) return
        var wf = workflows[selectedWorkflowIndex]
        for (var i = 0; i < wf.nodes.length; i++) {
            if (wf.nodes[i].id === selectedNodeId) {
                if (!wf.nodes[i].parameters) wf.nodes[i].parameters = {}
                wf.nodes[i].parameters[key] = value
                break
            }
        }
    }

    function createNewWorkflow() {
        var newWf = {
            name: "new_workflow_" + (workflows.length + 1),
            active: false, settings: {}, tags: [],
            meta: { description: "" }, variables: {},
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
                else appendWorkflowLocally(newWf)
            })
        } else {
            appendWorkflowLocally(newWf)
        }
    }

    function appendWorkflowLocally(wf) {
        var wfs = workflows.slice()
        wfs.push(wf)
        workflows = wfs
        selectedWorkflowIndex = wfs.length - 1
        selectedNodeId = ""
    }

    function runTestExecution() {
        executionStatus = "running"
        testOutput = "Executing workflow " + currentWorkflow.name + "..."
        testPanelVisible = true
        executionTimer.start()
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadWorkflows()
    }

    Component.onCompleted: {
        loadMockData()
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
        CWorkflowToolbar {
            Layout.fillWidth: true
            workflow: currentWorkflow
            useLiveData: root.useLiveData
            zoom: root.zoom
            executionStatus: root.executionStatus
            nodeCount: workflowNodes.length
            tags: workflowTags

            onResetZoom: root.zoom = 1.0
            onToggleActive: function(active) {
                workflows[selectedWorkflowIndex].active = active
                workflows = workflows.slice()
                if (useLiveData) saveWorkflow(workflows[selectedWorkflowIndex])
            }
            onNewWorkflow: createNewWorkflow()
            onRunTest: runTestExecution()
        }

        // ── CONTENT ROW ─────────────────────────────────────────
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // ── LEFT: Workflow List + Node Palette ───────────────
            CWorkflowSidebar {
                workflows: root.workflows
                selectedWorkflowIndex: root.selectedWorkflowIndex
                canvasWidth: workflowCanvas.width
                canvasHeight: workflowCanvas.height

                onWorkflowSelected: function(index) {
                    root.selectedWorkflowIndex = index
                    root.selectedNodeId = ""
                    testOutput = ""
                    executionStatus = ""
                    workflowCanvas.requestPaint()
                }
                onNodeDoubleClicked: function(nodeType, cx, cy) {
                    addNodeToCanvas(nodeType, cx, cy)
                }
            }

            // ── CENTER: Infinite Canvas ──────────────────────────
            CWorkflowCanvas {
                id: workflowCanvas
                Layout.fillWidth: true
                Layout.fillHeight: true
                nodes: workflowNodes
                connections: workflowConnections
                zoom: root.zoom
                selectedNodeId: root.selectedNodeId
                drawingConnection: root.drawingConnection
                connSourceNode: root.connSourceNode
                connSourcePort: root.connSourcePort
                connSourceIsOutput: root.connSourceIsOutput
                connDragX: root.connDragX
                connDragY: root.connDragY

                onNodeSelected: function(id) { root.selectedNodeId = id }
                onCanvasClicked: root.selectedNodeId = ""
                onNodeDropped: function(type, x, y) { addNodeToCanvas(type, x, y) }
                onNodeMoved: function(id, x, y) {
                    var wf = workflows[selectedWorkflowIndex]
                    for (var i = 0; i < wf.nodes.length; i++) {
                        if (wf.nodes[i].id === id) {
                            wf.nodes[i].position = [x, y]
                            break
                        }
                    }
                    workflows = workflows.slice()
                    workflowCanvas.requestPaint()
                    if (useLiveData) saveWorkflow(wf)
                }
                onConnectionDragStarted: function(nodeId, portName, isOutput, portX, portY) {
                    drawingConnection = true
                    connSourceNode = nodeId
                    connSourcePort = portName
                    connSourceIsOutput = isOutput
                    connDragX = portX
                    connDragY = portY
                }
                onConnectionDragUpdated: function(x, y) {
                    connDragX = x
                    connDragY = y
                    workflowCanvas.requestPaint()
                }
                onConnectionDragFinished: {
                    drawingConnection = false
                    connSourceNode = ""
                    workflowCanvas.requestPaint()
                }
                onConnectionCompleted: function(nodeId, portName) {
                    addConnection(connSourceNode, connSourcePort, nodeId, portName)
                    drawingConnection = false
                    connSourceNode = ""
                    workflowCanvas.requestPaint()
                }
                onZoomChanged: function(newZoom) {
                    root.zoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
                }
            }

            // ── RIGHT: Properties Panel ─────────────────────────
            CNodePropertiesPanel {
                Layout.preferredWidth: selectedNode ? 300 : 0
                Layout.fillHeight: true
                node: root.selectedNode
                workflowVariables: root.workflowVariables

                onNameChanged: function(name) { updateNodeName(name) }
                onParameterChanged: function(key, value) { updateNodeParameter(key, value) }
                onDeleteRequested: removeNode(selectedNodeId)
                onClosed: root.selectedNodeId = ""
            }
        }

        // ── BOTTOM: Test Execution Panel ────────────────────────
        CWorkflowTestPanel {
            panelVisible: root.testPanelVisible
            executionStatus: root.executionStatus
            testInput: root.testInput
            testOutput: root.testOutput
            canExecute: currentWorkflow !== null

            onToggleVisibility: root.testPanelVisible = !root.testPanelVisible
            onExecuteRequested: runTestExecution()
            onTestInputChanged: root.testInput = testInput
        }
    }
}
