import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

Switch {
    id: switchControl
    property alias label: labelText.text
    property color thumbOnColor: MaterialPalette.primary
    property color trackOnColor: MaterialPalette.primaryContainer
    property color trackOffColor: MaterialPalette.surfaceVariant

    indicator: Rectangle {
        radius: height / 2
        color: switchControl.checked ? thumbOnColor : MaterialPalette.surface
    }

    background: Rectangle {
        radius: height / 2
        color: switchControl.checked ? trackOnColor : trackOffColor
    }

    Text {
        id: labelText
        anchors.verticalCenter: parent.verticalCenter
        anchors.left: parent.right
        anchors.leftMargin: 10
        color: MaterialPalette.onSurface
        font.pixelSize: 14
    }
}
