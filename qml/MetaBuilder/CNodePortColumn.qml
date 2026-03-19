import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CNodePortColumn.qml - Reusable input/output port column for workflow nodes
 *
 * Usage:
 *   CNodePortColumn {
 *       ports: nodeData.inputs || []
 *       isOutput: false
 *       portRadius: 6
 *       portSpacing: 24
 *       portColor: Theme.primary
 *       nodeId: "node-1"
 *       canvasContentItem: canvasContent
 *       drawingConnection: false
 *       connSourceIsOutput: true
 *   }
 */
Column {
    id: portCol

    property var ports: []
    property bool isOutput: false
    property int portRadius: 6
    property int portSpacing: 24
    property color portColor: isOutput ? Theme.success : Theme.primary
    property string nodeId: ""
    property Item canvasContentItem: null
    property bool drawingConnection: false
    property bool connSourceIsOutput: true

    signal connectionDragStarted(
        string nodeId, string portName,
        bool isOutput, real portX, real portY)
    signal connectionCompleted(string nodeId, string portName)

    spacing: portSpacing - portRadius * 2

    Repeater {
        model: portCol.ports
        Item {
            width: portCol.portRadius * 2
            height: portCol.portRadius * 2

            Rectangle {
                id: portDot
                width: portCol.portRadius * 2
                height: portCol.portRadius * 2
                radius: portCol.portRadius
                color: portCol.portColor
                border.color: "#FFFFFF"
                border.width: 1.5

                MouseArea {
                    anchors.fill: parent
                    anchors.margins: -6
                    cursorShape: Qt.CrossCursor
                    hoverEnabled: true

                    onPressed: {
                        if (portCol.isOutput) {
                            if (portCol.canvasContentItem) {
                                var globalPos = portDot.mapToItem(
                                    portCol.canvasContentItem,
                                    portCol.portRadius,
                                    portCol.portRadius)
                                portCol.connectionDragStarted(
                                    portCol.nodeId,
                                    modelData.name, true,
                                    globalPos.x, globalPos.y)
                            }
                        } else {
                            if (portCol.drawingConnection
                                && portCol.connSourceIsOutput) {
                                portCol.connectionCompleted(
                                    portCol.nodeId,
                                    modelData.name)
                            }
                        }
                    }
                }
            }
        }
    }
}
