import QtQuick
import QtQuick.Controls

import "MaterialPalette.qml" as MaterialPalette

Popup {
    id: popover
    modal: false
    focus: true
    background: Rectangle {
        color: MaterialPalette.surface
        border.color: MaterialPalette.outline
        radius: 12
    }
    contentItem: Column {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 8
    }
}
