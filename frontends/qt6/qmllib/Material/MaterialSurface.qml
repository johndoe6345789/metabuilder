import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

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

    Loader {
        id: loader
        anchors.fill: parent
        anchors.margins: 16
        sourceComponent: contentComponent
    }
}
