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

    function requestPaint() {
        connectionLayer.requestPaint()
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

    // Drop area for palette drag
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

        Component.onCompleted: {
            contentX = 1500
            contentY = 1500
        }

        // Expose for external double-click-to-add centering
        function centerX() { return contentX + width / 2 }
        function centerY() { return contentY + height / 2 }

        Item {
            id: canvasContent
            width: canvas.contentWidth
            height: canvas.contentHeight

            transform: Scale {
                origin.x: 0
                origin.y: 0
                xScale: root.zoom
                yScale: root.zoom
            }

            // Grid background
            Canvas {
                id: gridLayer
                anchors.fill: parent
                onPaint: {
                    var ctx = getContext("2d")
                    ctx.reset()
                    var gridSize = 50
                    ctx.strokeStyle = Qt.rgba(0.5, 0.5, 0.5, 0.1)
                    ctx.lineWidth = 1

                    for (var x = 0; x < width; x += gridSize) {
                        ctx.beginPath()
                        ctx.moveTo(x, 0)
                        ctx.lineTo(x, height)
                        ctx.stroke()
                    }
                    for (var y = 0; y < height; y += gridSize) {
                        ctx.beginPath()
                        ctx.moveTo(0, y)
                        ctx.lineTo(width, y)
                        ctx.stroke()
                    }
                }
                Component.onCompleted: requestPaint()
            }

            // Connection layer (Bezier curves)
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

            // Node layer
            Repeater {
                id: nodeRepeater
                model: root.nodes.length
                z: 2

                delegate: Rectangle {
                    id: nodeRect
                    property var nodeData: root.nodes[index]
                    property bool isSelected: root.selectedNodeId === nodeData.id
                    property int portRadius: 6
                    property int headerHeight: 32
                    property int portSpacing: 24
                    property int nodeWidth: 180
                    property int inputCount: nodeData.inputs ? nodeData.inputs.length : 0
                    property int outputCount: nodeData.outputs ? nodeData.outputs.length : 0
                    property int bodyPorts: Math.max(inputCount, outputCount)

                    x: nodeData.position[0]
                    y: nodeData.position[1]
                    width: nodeWidth
                    height: headerHeight + Math.max(1, bodyPorts) * portSpacing + 16
                    radius: 8
                    color: isSelected ? Qt.lighter(Theme.paper, 1.1) : Theme.paper
                    border.color: isSelected ? groupColor(nodeData.type) : Theme.border
                    border.width: isSelected ? 2 : 1
                    z: isSelected ? 10 : 2

                    // Header
                    Rectangle {
                        id: nodeHeader
                        anchors.top: parent.top
                        anchors.left: parent.left
                        anchors.right: parent.right
                        height: headerHeight
                        radius: 8
                        color: groupColor(nodeData.type)

                        Rectangle {
                            anchors.bottom: parent.bottom
                            anchors.left: parent.left
                            anchors.right: parent.right
                            height: parent.radius
                            color: parent.color
                        }

                        CText {
                            anchors.centerIn: parent
                            text: nodeData.name || nodeData.type
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
                        text: nodeData.type
                        variant: "caption"
                        font.pixelSize: 9
                        color: Theme.textSecondary || Theme.text
                        opacity: 0.6
                    }

                    // Input ports
                    Column {
                        anchors.left: parent.left
                        anchors.leftMargin: -portRadius
                        anchors.top: nodeHeader.bottom
                        anchors.topMargin: 8
                        spacing: portSpacing - portRadius * 2

                        Repeater {
                            model: nodeData.inputs || []
                            Item {
                                width: portRadius * 2
                                height: portRadius * 2

                                Rectangle {
                                    id: inPort
                                    width: portRadius * 2
                                    height: portRadius * 2
                                    radius: portRadius
                                    color: Theme.primary
                                    border.color: "#FFFFFF"
                                    border.width: 1.5

                                    MouseArea {
                                        anchors.fill: parent
                                        anchors.margins: -6
                                        cursorShape: Qt.CrossCursor
                                        hoverEnabled: true

                                        onPressed: {
                                            if (root.drawingConnection && root.connSourceIsOutput) {
                                                root.connectionCompleted(nodeData.id, modelData.name)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Output ports
                    Column {
                        anchors.right: parent.right
                        anchors.rightMargin: -portRadius
                        anchors.top: nodeHeader.bottom
                        anchors.topMargin: 8
                        spacing: portSpacing - portRadius * 2

                        Repeater {
                            model: nodeData.outputs || []
                            Item {
                                width: portRadius * 2
                                height: portRadius * 2

                                Rectangle {
                                    id: outPort
                                    width: portRadius * 2
                                    height: portRadius * 2
                                    radius: portRadius
                                    color: Theme.success
                                    border.color: "#FFFFFF"
                                    border.width: 1.5

                                    MouseArea {
                                        anchors.fill: parent
                                        anchors.margins: -6
                                        cursorShape: Qt.CrossCursor
                                        hoverEnabled: true

                                        onPressed: {
                                            var globalPos = outPort.mapToItem(canvasContent, portRadius, portRadius)
                                            root.connectionDragStarted(nodeData.id, modelData.name, true, globalPos.x, globalPos.y)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Drag handler for moving the node
                    DragHandler {
                        id: nodeDrag
                        target: nodeRect
                        onActiveChanged: {
                            if (!active) {
                                root.nodeMoved(nodeData.id, nodeRect.x, nodeRect.y)
                            }
                        }
                        onCentroidChanged: {
                            connectionLayer.requestPaint()
                        }
                    }

                    // Click to select
                    TapHandler {
                        onTapped: {
                            root.nodeSelected(nodeData.id)
                        }
                    }
                }
            }

            // Canvas mouse area for connection drawing + zoom
            MouseArea {
                anchors.fill: parent
                z: 0
                acceptedButtons: Qt.LeftButton | Qt.MiddleButton
                hoverEnabled: true

                onPositionChanged: function(mouse) {
                    if (root.drawingConnection) {
                        root.connectionDragUpdated(mouse.x, mouse.y)
                    }
                }

                onReleased: function(mouse) {
                    if (root.drawingConnection) {
                        root.connectionDragFinished()
                    }
                }

                onClicked: function(mouse) {
                    root.canvasClicked()
                }

                onWheel: function(wheel) {
                    var zoomDelta = wheel.angleDelta.y > 0 ? 0.1 : -0.1
                    root.zoomChanged(root.zoom + zoomDelta)
                }
            }
        }
    }

    // Zoom overlay
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.margins: 12
        width: 120
        height: 36
        radius: 18
        color: Qt.rgba(Theme.paper.r || 0.1, Theme.paper.g || 0.1, Theme.paper.b || 0.1, 0.9)
        border.color: Theme.border
        border.width: 1

        RowLayout {
            anchors.centerIn: parent
            spacing: 8

            CButton {
                text: "-"
                variant: "ghost"
                size: "sm"
                onClicked: root.zoomChanged(root.zoom - 0.1)
            }

            CText {
                variant: "caption"
                text: Math.round(root.zoom * 100) + "%"
            }

            CButton {
                text: "+"
                variant: "ghost"
                size: "sm"
                onClicked: root.zoomChanged(root.zoom + 0.1)
            }
        }
    }

    // Empty state
    CText {
        anchors.centerIn: parent
        visible: root.nodes.length === 0
        text: "Empty canvas — drag nodes from the palette or double-click a node type"
        variant: "body1"
        opacity: 0.5
    }
}
