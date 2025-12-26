import QtQuick 2.15
import QtQuick.Controls 2.15
import QtGraphicalEffects 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: root
    property alias text: label.text
    property bool outlined: false
    property bool elevated: true
    property color fillColor: outlined ? "transparent" : MaterialPalette.palette.primary
    property color borderColor: outlined ? MaterialPalette.palette.outline : "transparent"
    property color textColor: outlined ? MaterialPalette.palette.primary : MaterialPalette.palette.onPrimary
    property bool disabled: false
    property real cornerRadius: 12
    signal clicked()

    implicitHeight: 48
    radius: cornerRadius
    color: disabled ? MaterialPalette.palette.surfaceVariant : fillColor
    border.color: disabled ? MaterialPalette.palette.surfaceVariant : borderColor
    border.width: outlined ? 1 : 0
    layer.enabled: elevated && !outlined && !disabled
    layer.effect: DropShadow {
        anchors.fill: parent
        horizontalOffset: 0
        verticalOffset: 4
        radius: 16
        samples: 16
        color: "#22000000"
    }

    Text {
        id: label
        anchors.centerIn: parent
        font.pixelSize: 15
        font.bold: true
        color: disabled ? MaterialPalette.palette.surface : textColor
    }

    MouseArea {
        anchors.fill: parent
        enabled: !disabled
        hoverEnabled: true
        onClicked: root.clicked()
        onPressed: root.opacity = 0.7
        onReleased: root.opacity = 1
    }
}
