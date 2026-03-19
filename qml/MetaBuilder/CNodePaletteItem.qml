import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    required property var modelData
    property color accentColor: Theme.primary

    signal nodeDoubleClicked(string nodeType)

    height: 40
    radius: 4
    color: paletteMA.containsMouse
        ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.08)
        : "transparent"
    border.color: paletteMA.containsMouse ? Theme.border : "transparent"
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.margins: 6
        spacing: 8

        Rectangle {
            width: 6
            height: 24
            radius: 3
            color: root.accentColor
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 0
            CText {
                variant: "body2"
                text: modelData.displayName || modelData.name || ""
                font.bold: true
                elide: Text.ElideRight
                Layout.fillWidth: true
            }
            CText {
                variant: "caption"
                text: modelData.group || ""
                font.pixelSize: 9
            }
        }
    }

    MouseArea {
        id: paletteMA
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor

        onDoubleClicked: {
            root.nodeDoubleClicked(modelData.name)
        }
    }

    Drag.active: paletteDragHandler.active
    Drag.hotSpot.x: width / 2
    Drag.hotSpot.y: height / 2
    Drag.mimeData: ({ "text/node-type": modelData.name || "" })

    DragHandler {
        id: paletteDragHandler
    }
}
