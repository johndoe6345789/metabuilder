import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

Switch {
    id: switchControl
    property alias text: label.text
    property color thumbOnColor: MaterialPalette.primary
    property color trackOnColor: MaterialPalette.primaryContainer
    property color trackOffColor: MaterialPalette.surfaceVariant
    contentItem: Rectangle {
        id: label
        anchors.centerIn: parent
        color: "transparent"
        font.pixelSize: 14
        color: MaterialPalette.onSurface
    }
    indicator: Rectangle {
        radius: height / 2
        color: switchControl.checked ? thumbOnColor : MaterialPalette.surface
    }
    background: Rectangle {
        radius: height / 2
        color: switchControl.checked ? trackOnColor : trackOffColor
    }
}
