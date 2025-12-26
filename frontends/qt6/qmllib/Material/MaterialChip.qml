import QtQuick 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: chip
    property string text: ""
    property color fillColor: MaterialPalette.palette.surfaceVariant
    property color textColor: MaterialPalette.palette.onSurface
    property bool outlined: false

    radius: 999
    height: 32
    implicitWidth: label.width + 32
    color: outlined ? "transparent" : fillColor
    border.color: outlined ? MaterialPalette.palette.outline : "transparent"
    border.width: outlined ? 1 : 0

    Text {
        id: label
        anchors.centerIn: parent
        font.pixelSize: 14
        text: chip.text
        color: textColor
    }
}
