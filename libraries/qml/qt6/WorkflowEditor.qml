import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root; color: "transparent"
    objectName: "view_workflow_editor"
    Accessible.role: Accessible.Pane
    Accessible.name: "Workflow Editor"
    Accessible.description:
        "Visual workflow editor. " +
        "Drag nodes from the sidebar " +
        "onto the canvas to build workflows."
    DBALProvider { id: dbal }
    CWorkflowState {
        id: wfState; dbal: dbal
        canvasRef: workflowCanvas
        mockDataUrl: Qt.resolvedUrl(
            "config/workflow-mock-data.json")
    }
    onVisibleChanged:
        if (visible && !wfState.workflows.length)
            wfState.initialize()
    Component.onCompleted: wfState.initialize()
    Connections {
        target: dbal
        function onConnectedChanged() {
            if (dbal.connected)
                wfState.loadWorkflows()
        }
    }

    ColumnLayout {
        anchors.fill: parent; spacing: 0
        CWorkflowToolbar {
            Layout.fillWidth: true
            workflow: wfState.currentWorkflow
            useLiveData: wfState.useLiveData
            zoom: wfState.zoom
            executionStatus:
                wfState.executionStatus
            nodeCount:
                wfState.workflowNodes.length
            tags: wfState.workflowTags
            onResetZoom: wfState.zoom = 1.0
            onToggleActive: function(active) {
                wfState.toggleActive(active)
            }
            onNewWorkflow:
                wfState.createNewWorkflow()
            onRunTest:
                wfState.runTestExecution()
        }
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true; spacing: 0
            CWorkflowSidebar {
                workflows: wfState.workflows
                selectedWorkflowIndex:
                    wfState.selectedWorkflowIndex
                canvasWidth:
                    workflowCanvas.width
                canvasHeight:
                    workflowCanvas.height
                onWorkflowSelected:
                    function(index) {
                    wfState.selectWorkflow(index)
                }
                onNodeDoubleClicked:
                    function(type, cx, cy) {
                    wfState.addNodeToCanvas(
                        type, cx, cy)
                }
            }
            CWorkflowCanvas {
                id: workflowCanvas
                objectName: "canvas_workflow"
                Accessible.role: Accessible.Canvas
                Accessible.name: "Workflow Canvas"
                Accessible.description:
                    "Interactive canvas. " +
                    "Drag nodes to reposition. " +
                    "Connect ports by dragging " +
                    "between them."
                activeFocusOnTab: true
                Layout.fillWidth: true
                Layout.fillHeight: true
                nodes: wfState.workflowNodes
                connections:
                    wfState.workflowConnections
                zoom: wfState.zoom
                selectedNodeId:
                    wfState.selectedNodeId
                drawingConnection:
                    wfState.drawingConnection
                connSourceNode:
                    wfState.connSourceNode
                connSourcePort:
                    wfState.connSourcePort
                connSourceIsOutput:
                    wfState.connSourceIsOutput
                connDragX: wfState.connDragX
                connDragY: wfState.connDragY
                onNodeSelected: function(id) {
                    wfState.selectedNodeId = id
                }
                onCanvasClicked:
                    wfState.selectedNodeId = ""
                onNodeDropped:
                    function(type, x, y) {
                    wfState.addNodeToCanvas(
                        type, x, y)
                }
                onNodeMoved:
                    function(id, x, y) {
                    wfState.moveNode(id, x, y)
                }
                onConnectionDragStarted:
                    function(nId, port,
                        isOut, px, py) {
                    wfState.startConnectionDrag(
                        nId, port,
                        isOut, px, py)
                }
                onConnectionDragUpdated:
                    function(x, y) {
                    wfState
                        .updateConnectionDrag(
                            x, y)
                }
                onConnectionDragFinished:
                    wfState
                        .finishConnectionDrag()
                onConnectionCompleted:
                    function(nId, port) {
                    wfState.completeConnection(
                        nId, port)
                }
                onZoomUpdated: function(z) {
                    wfState.setZoom(z)
                }
            }
            CNodePropertiesPanel {
                Layout.preferredWidth:
                    wfState.selectedNode
                        ? 300 : 0
                Layout.fillHeight: true
                node: wfState.selectedNode
                workflowVariables:
                    wfState.workflowVariables
                onNameChanged: function(name) {
                    wfState.updateNodeName(name)
                }
                onParameterChanged:
                    function(key, val) {
                    wfState.updateNodeParameter(
                        key, val)
                }
                onDeleteRequested:
                    wfState.removeNode(
                        wfState.selectedNodeId)
                onClosed:
                    wfState.selectedNodeId = ""
            }
        }
        CWorkflowTestPanel {
            panelVisible:
                wfState.testPanelVisible
            executionStatus:
                wfState.executionStatus
            testInput: wfState.testInput
            testOutput: wfState.testOutput
            canExecute:
                wfState.currentWorkflow !== null
            onToggleVisibility:
                wfState.testPanelVisible =
                    !wfState.testPanelVisible
            onExecuteRequested:
                wfState.runTestExecution()
            onTestInputChanged:
                wfState.testInput = testInput
        }
    }
}
