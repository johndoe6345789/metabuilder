import QtQuick 2.15
import QtQuick.Controls 2.15

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
