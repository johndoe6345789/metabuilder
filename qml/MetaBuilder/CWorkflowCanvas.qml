import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var nodes: []
    property var connections: ({})
    property real zoom: 1.0
    property string selectedNodeId: ""
    property bool drawingConnection: false
    property string connSourceNode: ""
    property string connSourcePort: ""
    property bool connSourceIsOutput: true
    property real connDragX: 0
    property real connDragY: 0

    signal nodeSelected(string id)
    signal nodeMoved(string id, real x, real y)
    signal connectionCreated(string srcId, string srcPort, string dstId, string dstPort)
    signal nodeDropped(string type, real x, real y)
    signal zoomChanged(real zoom)
    signal canvasClicked()
    signal connectionDragStarted(string nodeId, string portName, bool isOutput, real portX, real portY)
    signal connectionDragUpdated(real x, real y)
    signal connectionDragFinished()
    signal connectionCompleted(string nodeId, string portName)

    color: Theme.background
    clip: true

    function requestPaint() { connectionLayer.requestPaint() }

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

    DropArea {
        anchors.fill: parent
        keys: ["text/node-type"]
        onDropped: function(drop) {
            var nodeType = drop.getDataAsString("text/node-type")
            if (nodeType) {
                var localPos = mapToItem(canvasContent, drop.x, drop.y)
                root.nodeDropped(nodeType, localPos.x, localPos.y)
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

        Component.onCompleted: { contentX = 1500; contentY = 1500 }

        Item {
            id: canvasContent
            width: canvas.contentWidth
            height: canvas.contentHeight

            transform: Scale {
                origin.x: 0; origin.y: 0
                xScale: root.zoom; yScale: root.zoom
            }

            CCanvasGrid { anchors.fill: parent }

            CConnectionLayer {
                id: connectionLayer
                anchors.fill: parent
                z: 1
                nodes: root.nodes
                connections: root.connections
                drawingConnection: root.drawingConnection
                connSourceNode: root.connSourceNode
                connSourceIsOutput: root.connSourceIsOutput
                connDragX: root.connDragX
                connDragY: root.connDragY
            }

            Repeater {
                model: root.nodes.length
                z: 2

                delegate: CWorkflowNodeDelegate {
                    nodeData: root.nodes[index]
                    isSelected: root.selectedNodeId === nodeData.id
                    groupColorValue: groupColor(nodeData.type)
                    drawingConnection: root.drawingConnection
                    connSourceIsOutput: root.connSourceIsOutput
                    canvasContentItem: canvasContent

                    onNodeSelected: function(id) { root.nodeSelected(id) }
                    onNodeMoved: function(id, x, y) { root.nodeMoved(id, x, y) }
                    onConnectionDragStarted: function(nId, pName, isOut, pX, pY) {
                        root.connectionDragStarted(nId, pName, isOut, pX, pY)
                    }
                    onConnectionCompleted: function(nId, pName) { root.connectionCompleted(nId, pName) }
                    onPaintRequested: connectionLayer.requestPaint()
                }
            }

            CCanvasInteractionArea {
                anchors.fill: parent
                drawingConnection: root.drawingConnection
                onConnectionDragUpdated: function(x, y) { root.connectionDragUpdated(x, y) }
                onConnectionDragFinished: root.connectionDragFinished()
                onCanvasClicked: root.canvasClicked()
                onZoomRequested: function(delta) { root.zoomChanged(root.zoom + delta) }
            }
        }
    }

    CCanvasZoomOverlay {
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.margins: 12
        zoom: root.zoom
        onZoomIn: root.zoomChanged(root.zoom + 0.1)
        onZoomOut: root.zoomChanged(root.zoom - 0.1)
    }

    CText {
        anchors.centerIn: parent
        visible: root.nodes.length === 0
        text: "Empty canvas — drag nodes from the palette or double-click a node type"
        variant: "body1"
        opacity: 0.5
    }
}
