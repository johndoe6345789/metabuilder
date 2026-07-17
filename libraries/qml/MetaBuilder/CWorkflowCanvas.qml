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
    signal connectionCreated(
        string srcId, string srcPort,
        string dstId, string dstPort)
    signal nodeDropped(string type, real x, real y)
    signal zoomUpdated(real zoom)
    signal canvasClicked()
    signal connectionDragStarted(
        string nodeId, string portName,
        bool isOutput, real portX, real portY)
    signal connectionDragUpdated(real x, real y)
    signal connectionDragFinished()
    signal connectionCompleted(
        string nodeId, string portName)

    color: Theme.background
    clip: true

    function requestPaint() {
        viewport.connectionLayer.requestPaint()
    }

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
            var nodeType = drop.getDataAsString(
                "text/node-type")
            if (nodeType) {
                var localPos = mapToItem(
                    viewport.canvasContent,
                    drop.x, drop.y)
                root.nodeDropped(
                    nodeType,
                    localPos.x, localPos.y)
            }
        }
    }

    CCanvasViewport {
        id: viewport
        anchors.fill: parent
        nodes: root.nodes
        connections: root.connections
        zoom: root.zoom
        selectedNodeId: root.selectedNodeId
        drawingConnection: root.drawingConnection
        connSourceNode: root.connSourceNode
        connSourceIsOutput: root.connSourceIsOutput
        connDragX: root.connDragX
        connDragY: root.connDragY
        groupColorFn: root.groupColor
        onNodeSelected: function(id) {
            root.nodeSelected(id)
        }
        onNodeMoved: function(id, x, y) {
            root.nodeMoved(id, x, y)
        }
        onConnectionDragStarted:
            function(nId, p, o, pX, pY) {
                root.connectionDragStarted(
                    nId, p, o, pX, pY)
            }
        onConnectionCompleted:
            function(nId, p) {
                root.connectionCompleted(nId, p)
            }
        onConnectionDragUpdated:
            function(x, y) {
                root.connectionDragUpdated(x, y)
            }
        onConnectionDragFinished: {
            root.connectionDragFinished()
        }
        onCanvasClicked: root.canvasClicked()
        onZoomRequested: function(d) {
            root.zoomChanged(root.zoom + d)
        }
    }

    CCanvasZoomOverlay {
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.margins: 12
        zoom: root.zoom
        onZoomIn: {
            root.zoomChanged(root.zoom + 0.1)
        }
        onZoomOut: {
            root.zoomChanged(root.zoom - 0.1)
        }
    }

    CText {
        anchors.centerIn: parent
        visible: root.nodes.length === 0
        text: "Empty canvas \u2014 drag nodes"
            + " from the palette or"
            + " double-click a node type"
        variant: "body1"; opacity: 0.5
    }
}
