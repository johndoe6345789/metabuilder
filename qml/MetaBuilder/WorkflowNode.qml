import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: nodeRoot

    property string nodeId: ""
    property string nodeName: "Node"
    property string nodeType: "action"
    property string displayName: ""
    property var nodeInputs: []
    property var nodeOutputs: []
    property var parameters: ({})
    property real nodeX: 0
    property real nodeY: 0
    property bool selected: false
    property real zoom: 1.0

    // Port geometry constants
    readonly property int portRadius: 6
    readonly property int portSpacing: 24
    readonly property int headerHeight: 32
    readonly property int minWidth: 180
    readonly property int minHeight: headerHeight + Math.max(nodeInputs.length, nodeOutputs.length) * portSpacing + 16

    signal moved(string id, real newX, real newY)
    signal clicked(string id)
    signal doubleClicked(string id)
    signal portPressed(string nodeId, string portName, string portType, bool isOutput, real globalX, real globalY)
    signal portReleased(string nodeId, string portName, string portType, bool isOutput, real globalX, real globalY)

    x: nodeX
    y: nodeY
    width: minWidth
    height: minHeight
    radius: 8
    color: selected ? Qt.lighter(Theme.paper, 1.1) : Theme.paper
    border.color: selected ? groupColor() : Theme.border
    border.width: selected ? 2 : 1

    layer.enabled: true
    layer.effect: null

    function groupColor() {
        switch (nodeType.split(".")[0]) {
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

    // Header bar
    Rectangle {
        id: header
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: headerHeight
        radius: 8
        color: groupColor()

        // Square off bottom corners
        Rectangle {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: parent.radius
            color: parent.color
        }

        CText {
            anchors.centerIn: parent
            text: displayName || nodeName
            color: "#FFFFFF"
            variant: "body2"
            font.bold: true
            elide: Text.ElideRight
            width: parent.width - 16
            horizontalAlignment: Text.AlignHCenter
        }
    }

    // Drag handler on the header
    DragHandler {
        id: dragHandler
        target: nodeRoot
        onActiveChanged: {
            if (!active) {
                nodeRoot.moved(nodeId, nodeRoot.x, nodeRoot.y)
            }
        }
    }

    // Click handler
    TapHandler {
        onTapped: nodeRoot.clicked(nodeId)
        onDoubleTapped: nodeRoot.doubleClicked(nodeId)
    }

    // Input ports (left side)
    Column {
        anchors.left: parent.left
        anchors.leftMargin: -portRadius
        anchors.top: header.bottom
        anchors.topMargin: 8
        spacing: portSpacing - portRadius * 2

        Repeater {
            model: nodeInputs
            delegate: Item {
                width: portRadius * 2 + 60
                height: portRadius * 2

                Rectangle {
                    id: inputPort
                    width: portRadius * 2
                    height: portRadius * 2
                    radius: portRadius
                    color: Theme.primary
                    border.color: Theme.background
                    border.width: 1

                    MouseArea {
                        anchors.fill: parent
                        anchors.margins: -4
                        hoverEnabled: true
                        cursorShape: Qt.CrossCursor

                        onPressed: function(mouse) {
                            var global = inputPort.mapToItem(null, portRadius, portRadius)
                            nodeRoot.portPressed(nodeId, modelData.name, modelData.type, false, global.x, global.y)
                        }
                        onReleased: function(mouse) {
                            var global = inputPort.mapToItem(null, portRadius, portRadius)
                            nodeRoot.portReleased(nodeId, modelData.name, modelData.type, false, global.x, global.y)
                        }
                    }
                }

                CText {
                    anchors.left: inputPort.right
                    anchors.leftMargin: 4
                    anchors.verticalCenter: inputPort.verticalCenter
                    text: modelData.displayName || modelData.name || "in"
                    variant: "caption"
                    font.pixelSize: 10
                }
            }
        }
    }

    // Output ports (right side)
    Column {
        anchors.right: parent.right
        anchors.rightMargin: -portRadius
        anchors.top: header.bottom
        anchors.topMargin: 8
        spacing: portSpacing - portRadius * 2

        Repeater {
            model: nodeOutputs
            delegate: Item {
                width: portRadius * 2 + 60
                height: portRadius * 2
                layoutDirection: Qt.RightToLeft

                CText {
                    anchors.right: outputPort.left
                    anchors.rightMargin: 4
                    anchors.verticalCenter: outputPort.verticalCenter
                    text: modelData.displayName || modelData.name || "out"
                    variant: "caption"
                    font.pixelSize: 10
                    horizontalAlignment: Text.AlignRight
                }

                Rectangle {
                    id: outputPort
                    anchors.right: parent.right
                    width: portRadius * 2
                    height: portRadius * 2
                    radius: portRadius
                    color: Theme.success
                    border.color: Theme.background
                    border.width: 1

                    MouseArea {
                        anchors.fill: parent
                        anchors.margins: -4
                        hoverEnabled: true
                        cursorShape: Qt.CrossCursor

                        onPressed: function(mouse) {
                            var global = outputPort.mapToItem(null, portRadius, portRadius)
                            nodeRoot.portPressed(nodeId, modelData.name, modelData.type, true, global.x, global.y)
                        }
                        onReleased: function(mouse) {
                            var global = outputPort.mapToItem(null, portRadius, portRadius)
                            nodeRoot.portReleased(nodeId, modelData.name, modelData.type, true, global.x, global.y)
                        }
                    }
                }
            }
        }
    }
}
