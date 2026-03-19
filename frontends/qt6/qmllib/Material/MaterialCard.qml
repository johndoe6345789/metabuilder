import QtQuick
import QtQuick.Layouts

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: card
    property alias contentItem: contentLoader.sourceComponent
    property real cornerRadius: 16
    property color surfaceColor: MaterialPalette.surface
    property real elevation: MaterialPalette.elevationLow

    width: parent ? parent.width : 320
    radius: cornerRadius
    color: surfaceColor
    border.color: MaterialPalette.outline
    border.width: 1

    Loader {
        id: contentLoader
        anchors.fill: parent
        anchors.margins: 16
    }
}
