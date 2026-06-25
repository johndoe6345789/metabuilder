import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

Rectangle {
    id: nodeRect

    property var nodeData: ({})
    property bool isSelected: false
    property string groupColorValue: Theme.primary
    property bool drawingConnection: false
    property bool connSourceIsOutput: true

    signal nodeSelected(string id)
    signal nodeMoved(string id, real x, real y)
    signal connectionDragStarted(
        string nodeId, string portName,
        bool isOutput, real portX, real portY)
    signal connectionCompleted(
        string nodeId, string portName)
    signal paintRequested()

    // Provide access to canvasContent for port coordinate mapping
    property Item canvasContentItem: null

    readonly property int portRadius: 6
    readonly property int headerHeight: 32
    readonly property int portSpacing: 24
    readonly property int nodeWidth: 180
    readonly property int inputCount: nodeData.inputs
        ? nodeData.inputs.length : 0
    readonly property int outputCount: nodeData.outputs
        ? nodeData.outputs.length : 0
    readonly property int bodyPorts:
        Math.max(inputCount, outputCount)

    x: nodeData.position
        ? nodeData.position[0] : 0
    y: nodeData.position
        ? nodeData.position[1] : 0
    width: nodeWidth
    height: headerHeight
        + Math.max(1, bodyPorts) * portSpacing + 16
    radius: 8
    color: isSelected
        ? Qt.lighter(Theme.paper, 1.1)
        : Theme.paper
    border.color: isSelected
        ? groupColorValue : Theme.border
    border.width: isSelected ? 2 : 1
    z: isSelected ? 10 : 2

    // Header
    Rectangle {
        id: nodeHeader
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: nodeRect.headerHeight
        radius: 8
        color: nodeRect.groupColorValue

        Rectangle {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: parent.radius
            color: parent.color
        }

        CText {
            anchors.centerIn: parent
            text: nodeRect.nodeData.name
                || nodeRect.nodeData.type || ""
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
        text: nodeRect.nodeData.type || ""
        variant: "caption"
        font.pixelSize: 9
        color: Theme.textSecondary
            || Theme.text
        opacity: 0.6
    }

    // Input ports
    CNodePortColumn {
        anchors.left: parent.left
        anchors.leftMargin: -portRadius
        anchors.top: nodeHeader.bottom
        anchors.topMargin: 8
        ports: nodeRect.nodeData.inputs || []
        isOutput: false
        portRadius: nodeRect.portRadius
        portSpacing: nodeRect.portSpacing
        nodeId: nodeRect.nodeData.id || ""
        drawingConnection: nodeRect.drawingConnection
        connSourceIsOutput: nodeRect.connSourceIsOutput
        onConnectionCompleted: function(nId, pName) {
            nodeRect.connectionCompleted(nId, pName)
        }
    }

    // Output ports
    CNodePortColumn {
        anchors.right: parent.right
        anchors.rightMargin: -portRadius
        anchors.top: nodeHeader.bottom
        anchors.topMargin: 8
        ports: nodeRect.nodeData.outputs || []
        isOutput: true
        portRadius: nodeRect.portRadius
        portSpacing: nodeRect.portSpacing
        nodeId: nodeRect.nodeData.id || ""
        canvasContentItem: nodeRect.canvasContentItem
        onConnectionDragStarted: function(
            nId, pName, isOut, px, py
        ) {
            nodeRect.connectionDragStarted(
                nId, pName, isOut, px, py)
        }
    }

    // Drag handler for moving the node
    DragHandler {
        id: nodeDrag
        target: nodeRect
        onActiveChanged: {
            if (!active) {
                nodeRect.nodeMoved(
                    nodeRect.nodeData.id,
                    nodeRect.x, nodeRect.y)
            }
        }
        onCentroidChanged: {
            nodeRect.paintRequested()
        }
    }

    // Click to select
    TapHandler {
        onTapped: {
            nodeRect.nodeSelected(
                nodeRect.nodeData.id)
        }
    }
}
