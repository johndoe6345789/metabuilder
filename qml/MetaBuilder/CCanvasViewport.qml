import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Flickable {
    id: canvas
    objectName: "viewport_canvas"
    Accessible.role: Accessible.Canvas
    Accessible.name: "Canvas Viewport"
    Accessible.description:
        "Scrollable workflow canvas. " +
        "Contains nodes and connections. " +
        "Use zoom controls to resize the view."

    property alias canvasContent: contentItem
    property alias connectionLayer: connLayer
    property var nodes: []
    property var connections: ({})
    property real zoom: 1.0
    property string selectedNodeId: ""
    property bool drawingConnection: false
    property string connSourceNode: ""
    property bool connSourceIsOutput: true
    property real connDragX: 0
    property real connDragY: 0

    property var groupColorFn: function(t) { return "gray" }

    signal nodeSelected(string id)
    signal nodeMoved(string id, real x, real y)
    signal connectionDragStarted(string nodeId, string portName, bool isOutput,
        real portX, real portY)
    signal connectionCompleted(string nodeId, string portName)
    signal connectionDragUpdated(real x, real y)
    signal connectionDragFinished()
    signal canvasClicked()
    signal zoomRequested(real delta)

    contentWidth: 5000
    contentHeight: 5000
    clip: true
    boundsBehavior: Flickable.StopAtBounds
    Component.onCompleted: { contentX = 1500; contentY = 1500 }

    Item {
        id: contentItem
        width: canvas.contentWidth
        height: canvas.contentHeight

        transform: Scale {
            origin.x: 0; origin.y: 0
            xScale: canvas.zoom; yScale: canvas.zoom
        }

        CCanvasGrid { anchors.fill: parent }

        CConnectionLayer {
            id: connLayer
            anchors.fill: parent; z: 1
            nodes: canvas.nodes
            connections: canvas.connections
            drawingConnection: canvas.drawingConnection
            connSourceNode: canvas.connSourceNode
            connSourceIsOutput: canvas.connSourceIsOutput
            connDragX: canvas.connDragX
            connDragY: canvas.connDragY
        }

        Repeater {
            model: canvas.nodes.length; z: 2
            delegate: CWorkflowNodeDelegate {
                nodeData: canvas.nodes[index]
                isSelected: canvas.selectedNodeId === nodeData.id
                groupColorValue: canvas.groupColorFn(nodeData.type)
                drawingConnection: canvas.drawingConnection
                connSourceIsOutput: canvas.connSourceIsOutput
                canvasContentItem: contentItem
                onNodeSelected: function(id) { canvas.nodeSelected(id) }
                onNodeMoved: function(id, x, y) { canvas.nodeMoved(id, x, y) }
                onConnectionDragStarted: function(nId, p, o, pX,
                    pY) { canvas.connectionDragStarted(nId, p, o, pX, pY) }
                onConnectionCompleted: function(nId,
                    p) { canvas.connectionCompleted(nId, p) }
                onPaintRequested: connLayer.requestPaint()
            }
        }

        CCanvasInteractionArea {
            anchors.fill: parent
            drawingConnection: canvas.drawingConnection
            onConnectionDragUpdated: function(x,
                y) { canvas.connectionDragUpdated(x, y) }
            onConnectionDragFinished: canvas.connectionDragFinished()
            onCanvasClicked: canvas.canvasClicked()
            onZoomRequested: function(d) { canvas.zoomRequested(d) }
        }
    }
}
