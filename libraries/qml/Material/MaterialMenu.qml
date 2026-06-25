import QtQuick
import QtQuick.Controls

import "MaterialPalette.qml" as MaterialPalette

Menu {
    id: menu
    background: Rectangle {
        color: MaterialPalette.surface
        border.color: MaterialPalette.outline
        radius: 12
    }
    contentItem: Column {
        spacing: 6
        anchors.margins: 8
    }
}
