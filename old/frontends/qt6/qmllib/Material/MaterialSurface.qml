import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import QtGraphicalEffects 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: surface
    property Component contentComponent: null
    property real elevation: MaterialPalette.elevationLow
    property color surfaceColor: MaterialPalette.surface
    property bool outlined: false

    radius: 18
    color: surfaceColor
    border.color: outlined ? MaterialPalette.outline : "transparent"
    border.width: outlined ? 1 : 0
    width: parent ? parent.width : 320
    layer.enabled: elevation > 0
    layer.effect: DropShadow {
        anchors.fill: parent
        horizontalOffset: 0
        verticalOffset: elevation / 2
        radius: elevation
        samples: 16
        color: "#22000000"
    }

    Loader {
        id: loader
        anchors.fill: parent
        anchors.margins: 16
        sourceComponent: contentComponent
    }
}
