import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtGraphicalEffects 1.15

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
    layer.enabled: true
    layer.effect: DropShadow {
        anchors.fill: parent
        horizontalOffset: 0
        verticalOffset: elevation / 2
        radius: elevation
        samples: 16
        color: "#22000000"
    }

    Loader {
        id: contentLoader
        anchors.fill: parent
        anchors.margins: 16
    }
}
