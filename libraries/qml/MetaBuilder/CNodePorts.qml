import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Column {
    id: portsRoot

    property var ports: []
    property bool isOutput: false
    property int portRadius: 6
    property int portSpacing: 24
    property string nodeId: ""

    signal portPressed(
        string nodeId, string portName,
        string portType, bool isOutput,
        real globalX, real globalY)
    signal portReleased(
        string nodeId, string portName,
        string portType, bool isOutput,
        real globalX, real globalY)

    spacing: portSpacing - portRadius * 2

    Repeater {
        model: portsRoot.ports
        delegate: Item {
            width: portsRoot.portRadius * 2 + 60
            height: portsRoot.portRadius * 2
            layoutDirection: portsRoot.isOutput
                ? Qt.RightToLeft : Qt.LeftToRight

            CText {
                id: portLabel
                visible: true
                anchors.verticalCenter: portDot.verticalCenter
                text: modelData.displayName
                    || modelData.name
                    || (portsRoot.isOutput
                        ? "out" : "in")
                variant: "caption"
                font.pixelSize: 10
                horizontalAlignment:
                    portsRoot.isOutput
                        ? Text.AlignRight
                        : Text.AlignLeft

                // Anchoring depends on side
                anchors.left: portsRoot.isOutput
                    ? undefined : portDot.right
                anchors.leftMargin:
                    portsRoot.isOutput ? 0 : 4
                anchors.right: portsRoot.isOutput
                    ? portDot.left : undefined
                anchors.rightMargin:
                    portsRoot.isOutput ? 4 : 0
            }

            Rectangle {
                id: portDot
                width: portsRoot.portRadius * 2
                height: portsRoot.portRadius * 2
                radius: portsRoot.portRadius
                color: portsRoot.isOutput ? Theme.success : Theme.primary
                border.color: Theme.background
                border.width: 1

                anchors.right: portsRoot.isOutput
                    ? parent.right : undefined

                MouseArea {
                    anchors.fill: parent
                    anchors.margins: -4
                    hoverEnabled: true
                    cursorShape: Qt.CrossCursor

                    onPressed: function(mouse) {
                        var global = portDot.mapToItem(
                            null,
                            portsRoot.portRadius,
                            portsRoot.portRadius)
                        portsRoot.portPressed(
                            portsRoot.nodeId,
                            modelData.name,
                            modelData.type,
                            portsRoot.isOutput,
                            global.x, global.y)
                    }
                    onReleased: function(mouse) {
                        var global = portDot.mapToItem(
                            null,
                            portsRoot.portRadius,
                            portsRoot.portRadius)
                        portsRoot.portReleased(
                            portsRoot.nodeId,
                            modelData.name,
                            modelData.type,
                            portsRoot.isOutput,
                            global.x, global.y)
                    }
                }
            }
        }
    }
}
