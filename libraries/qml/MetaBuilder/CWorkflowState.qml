import QtQuick
import "WorkflowMutations.js" as Mutations
import "WorkflowDBAL.js" as DBAL
import "WorkflowConnectionState.js" as ConnState

QtObject {
    id: state

    // ── External dependencies ────
    property var dbal: null
    property bool useLiveData: {
        return dbal ? dbal.connected : false
    }
    // CWorkflowCanvas for requestPaint()
    property var canvasRef: null
    // caller provides resolved URL to mock data JSON
    property url mockDataUrl: ""

    // ── Workflow list state ────
    property var workflows: []
    property int selectedWorkflowIndex: -1
    property var mockWorkflows: []

    // ── Selection / zoom ────
    property string selectedNodeId: ""
    property real zoom: 1.0
    readonly property real minZoom: 0.25
    readonly property real maxZoom: 2.0

    // ── Derived workflow data ────
    readonly property var currentWorkflow: {
        var ok = selectedWorkflowIndex >= 0
            && selectedWorkflowIndex < workflows.length
        return ok ? workflows[selectedWorkflowIndex] : null
    }
    readonly property var workflowNodes: {
        return currentWorkflow
            ? (currentWorkflow.nodes || []) : []
    }
    readonly property var workflowConnections: {
        return currentWorkflow
            ? (currentWorkflow.connections || {}) : {}
    }
    readonly property var workflowVariables: {
        return currentWorkflow
            ? (currentWorkflow.variables || {}) : {}
    }
    readonly property var workflowMeta: {
        return currentWorkflow
            ? (currentWorkflow.meta || {}) : {}
    }
    readonly property var workflowTags: {
        return currentWorkflow
            ? (currentWorkflow.tags || []) : []
    }

    readonly property var selectedNode: {
        if (!selectedNodeId || !workflowNodes) return null
        for (var i = 0; i < workflowNodes.length; i++) {
            if (workflowNodes[i].id === selectedNodeId)
                return workflowNodes[i]
        }
        return null
    }

    // ── Connection drawing state ────
    property bool drawingConnection: false
    property string connSourceNode: ""
    property string connSourcePort: ""
    property bool connSourceIsOutput: true
    property real connDragX: 0
    property real connDragY: 0

    // ── Test execution state ────
    property bool testPanelVisible: false
    property string testInput:
        '{"userId": "u-42", "email": "demo@example.com"}'
    property string testOutput: ""
    property string executionStatus: ""

    // ── Internals ────
    property Timer _execTimer: Timer {
        interval: 1800
        onTriggered: {
            if (!currentWorkflow) return
            var wf = currentWorkflow
            var lines = []
            var ts = Qt.formatTime(new Date(), "HH:mm:ss")
            lines.push("[" + ts + "] Workflow: " + wf.name)
            var cnt = wf.nodes ? wf.nodes.length : 0
            lines.push("[" + ts + "] Nodes: " + cnt)
            lines.push("")
            if (wf.nodes) {
                for (var i = 0; i < wf.nodes.length; i++) {
                    var n = wf.nodes[i]
                    var step = "  [" + (i + 1) + "/"
                        + wf.nodes.length + "] "
                    lines.push(step + n.type
                        + "::" + n.name + " ... OK")
                }
            }
            lines.push("")
            lines.push(
                "[RESULT] Workflow completed successfully."
            )
            executionStatus = "success"
            testOutput = lines.join("\n")
        }
    }

    // ── DBAL + persistence ────
    function loadWorkflows() {
        DBAL.loadWorkflows(dbal, mockWorkflows,
            function(parsed) {
            workflows = parsed
            if (selectedWorkflowIndex >= parsed.length)
                selectedWorkflowIndex =
                    parsed.length > 0 ? 0 : -1
            else if (selectedWorkflowIndex < 0
                && parsed.length > 0)
                selectedWorkflowIndex = 0
        })
    }

    function saveWorkflow(wf) {
        if (!useLiveData) return
        DBAL.saveWorkflow(dbal, wf,
            function() { loadWorkflows() })
    }

    function deleteWorkflow(index) {
        var wf = workflows[index]
        if (useLiveData && wf.id) {
            DBAL.deleteWorkflow(dbal, wf,
                function() { loadWorkflows() },
                function() { _deleteLocal(index) })
        } else {
            _deleteLocal(index)
        }
    }

    function _deleteLocal(index) {
        var copy = workflows.slice()
        copy.splice(index, 1)
        workflows = copy
        if (selectedWorkflowIndex >= copy.length)
            selectedWorkflowIndex = Math.max(0, copy.length - 1)
        selectedNodeId = ""
    }

    // ── Mutation wrappers ────
    function addNodeToCanvas(nodeType, posX, posY) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        var newId = Mutations.addNodeToCanvas(
            wf, nodeType, posX, posY, zoom,
            NodeRegistry)
        workflows = workflows.slice()
        selectedNodeId = newId
        _repaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function removeNode(nodeId) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        Mutations.removeNode(wf, nodeId)
        workflows = workflows.slice()
        if (selectedNodeId === nodeId) selectedNodeId = ""
        _repaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function moveNode(nodeId, x, y) {
        var wf = workflows[selectedWorkflowIndex]
        Mutations.moveNode(wf, nodeId, x, y)
        workflows = workflows.slice()
        _repaint()
        if (useLiveData) saveWorkflow(wf)
    }

    function addConnection(
        srcNodeId, srcPort, dstNodeId, dstPort
    ) {
        if (!currentWorkflow) return
        var wf = workflows[selectedWorkflowIndex]
        if (Mutations.addConnection(wf,
            srcNodeId, srcPort,
            dstNodeId, dstPort)) {
            workflows = workflows.slice()
            _repaint()
            if (useLiveData) saveWorkflow(wf)
        }
    }

    function updateNodeName(name) {
        Mutations.updateNodeName(
            workflows[selectedWorkflowIndex],
            selectedNodeId, name)
        workflows = workflows.slice()
    }

    function updateNodeParameter(key, value) {
        Mutations.updateNodeParameter(
            workflows[selectedWorkflowIndex],
            selectedNodeId, key, value)
    }

    function createNewWorkflow() {
        var newWf = {
            name: "new_workflow_"
                + (workflows.length + 1),
            active: false, settings: {}, tags: [],
            meta: { description: "" }, variables: {},
            nodes: [
                {
                    id: "trigger_1",
                    name: "Start",
                    type: "metabuilder.trigger",
                    position: [200, 250],
                    parameters: {
                        triggerType: "manual"
                    },
                    inputs: [],
                    outputs: [{
                        name: "main",
                        type: "main",
                        displayName: "Output"
                    }]
                }
            ],
            connections: {}
        }
        if (useLiveData) {
            DBAL.saveWorkflow(dbal, newWf,
                function(result, error) {
                if (!error) loadWorkflows()
                else _appendLocal(newWf)
            })
        } else {
            _appendLocal(newWf)
        }
    }

    function _appendLocal(wf) {
        var wfs = workflows.slice()
        wfs.push(wf)
        workflows = wfs
        selectedWorkflowIndex = wfs.length - 1
        selectedNodeId = ""
    }

    function toggleActive(active) {
        workflows[selectedWorkflowIndex].active = active
        workflows = workflows.slice()
        if (useLiveData)
            saveWorkflow(workflows[selectedWorkflowIndex])
    }

    function selectWorkflow(index) {
        selectedWorkflowIndex = index
        selectedNodeId = ""
        testOutput = ""
        executionStatus = ""
        _repaint()
    }

    // ── Connection drag delegates ────
    function startConnectionDrag(
        nodeId, portName, isOutput, portX, portY
    ) {
        var s = ConnState.startDrag(
            nodeId, portName, isOutput,
            portX, portY)
        drawingConnection = s.drawingConnection
        connSourceNode = s.connSourceNode
        connSourcePort = s.connSourcePort
        connSourceIsOutput =
            s.connSourceIsOutput
        connDragX = s.connDragX
        connDragY = s.connDragY
    }

    function updateConnectionDrag(x, y) {
        connDragX = x; connDragY = y
        _repaint()
    }

    function finishConnectionDrag() {
        var s = ConnState.finishDrag()
        drawingConnection = s.drawingConnection
        connSourceNode = s.connSourceNode
        _repaint()
    }

    function completeConnection(nodeId, portName) {
        addConnection(
            connSourceNode, connSourcePort,
            nodeId, portName)
        var s = ConnState.finishDrag()
        drawingConnection = s.drawingConnection
        connSourceNode = s.connSourceNode
        _repaint()
    }

    // ── Test execution ────
    function runTestExecution() {
        executionStatus = "running"
        testOutput = "Executing workflow "
            + currentWorkflow.name + "..."
        testPanelVisible = true
        _execTimer.start()
    }

    // ── Zoom ────
    function setZoom(newZoom) {
        zoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
    }

    // ── Helpers ────
    function _repaint() { if (canvasRef) canvasRef.requestPaint() }

    function initialize() {
        DBAL.loadMockData(mockDataUrl, function(data) {
            mockWorkflows = data
            loadWorkflows()
        })
    }
}
