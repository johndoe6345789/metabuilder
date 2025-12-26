import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: snackbar
    property string message: ""
    property string actionText: ""
    property bool open: false
    signal actionTriggered()
    implicitHeight: 56
    anchors.horizontalCenter: parent ? parent.horizontalCenter : undefined
    width: parent ? Math.min(parent.width * 0.8, 520) : 520
    radius: 12
    color: MaterialPalette.surfaceVariant
    border.color: MaterialPalette.outline
    border.width: 1
    opacity: open ? 1 : 0
    y: open ? (parent ? parent.height - implicitHeight - 32 : 0) : (parent ? parent.height : implicitHeight)
    Behavior on y { NumberAnimation { duration: 300; easing.type: Easing.OutQuad } }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 16

        Text {
            text: message
            color: MaterialPalette.onSurface
            font.pixelSize: 15
            Layout.fillWidth: true
            wrapMode: Text.Wrap
        }

        Button {
            visible: actionText.length > 0
            text: actionText
            font.pixelSize: 14
            background: Rectangle { color: "transparent" }
            onClicked: snackbar.actionTriggered()
        }
    }
}
