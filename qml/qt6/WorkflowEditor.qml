import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "../MetaBuilder/WorkflowMutations.js" as Mutations
import "../MetaBuilder/WorkflowDBAL.js" as DBAL

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

    // ── Mock data ──────────────────────────────────────────────
    property var mockWorkflows: []

    // ── DBAL + persistence delegates ───────────────────────────
    function loadWorkflows() {
        DBAL.loadWorkflows(dbal, mockWorkflows, function(parsed) {
            workflows = parsed
            if (selectedWorkflowIndex >= parsed.length)
                selectedWorkflowIndex = parsed.length > 0 ? 0 : -1
            else if (selectedWorkflowIndex < 0 && parsed.length > 0)
                selectedWorkflowIndex = 0
        })
    }

    function saveWorkflow(wf) {
        if (!useLiveData) return
        DBAL.saveWorkflow(dbal, wf, function() { loadWorkflows() })
    }

    function deleteWorkflow(index) {
        var wf = workflows[index]
        if (useLiveData && wf.id) {
            DBAL.deleteWorkflow(dbal, wf,
                function() { loadWorkflows() },
                function() { deleteWorkflowLocally(index) })
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

    // ── Thin mutation wrappers ─────────────────────────────────
    function addNodeToCanvas(nodeType, posX, posY) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        var newId = Mutations.addNodeToCanvas(wf, nodeType, posX, posY, zoom, NodeRegistry)
        workflows = workflows.slice()
        selectedNodeId = newId
        workflowCanvas.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function removeNode(nodeId) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        Mutations.removeNode(wf, nodeId)
        workflows = workflows.slice()
        if (selectedNodeId === nodeId) selectedNodeId = ""
        workflowCanvas.requestPaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function addConnection(srcNodeId, srcPort, dstNodeId, dstPort) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        if (Mutations.addConnection(wf, srcNodeId, srcPort, dstNodeId, dstPort)) {
            workflows = workflows.slice()
            workflowCanvas.requestPaint()
            if (useLiveData) saveWorkflow(wf)
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
            DBAL.saveWorkflow(dbal, newWf, function(result, error) {
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
        DBAL.loadMockData(Qt.resolvedUrl("config/workflow-mock-data.json"), function(data) {
            mockWorkflows = data
            loadWorkflows()
        })
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

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

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
                    Mutations.moveNode(wf, id, x, y)
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

            CNodePropertiesPanel {
                Layout.preferredWidth: selectedNode ? 300 : 0
                Layout.fillHeight: true
                node: root.selectedNode
                workflowVariables: root.workflowVariables

                onNameChanged: function(name) { Mutations.updateNodeName(workflows[selectedWorkflowIndex], selectedNodeId, name); workflows = workflows.slice() }
                onParameterChanged: function(key, value) { Mutations.updateNodeParameter(workflows[selectedWorkflowIndex], selectedNodeId, key, value) }
                onDeleteRequested: removeNode(selectedNodeId)
                onClosed: root.selectedNodeId = ""
            }
        }

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
