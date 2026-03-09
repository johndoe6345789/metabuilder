import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: iconButton
    property url iconSource: ""
    property bool disabled: false
    property alias tooltip: mouseArea.toolTip
    signal clicked()

    width: 48
    height: 48
    radius: width / 2
    color: iconButton.hovered && !disabled ? MaterialPalette.surfaceVariant : MaterialPalette.surface
    border.color: MaterialPalette.outline
    border.width: 1

    property bool hovered: false

    Image {
        anchors.centerIn: parent
        source: iconSource
        width: 20
        height: 20
        opacity: disabled ? 0.4 : 1
        fillMode: Image.PreserveAspectFit
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        enabled: !disabled
        onClicked: iconButton.clicked()
        onPressed: iconButton.scale = 0.95
        onReleased: iconButton.scale = 1
        onEntered: iconButton.hovered = true
        onExited: iconButton.hovered = false
    }
}
