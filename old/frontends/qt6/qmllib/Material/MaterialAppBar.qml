import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtGraphicalEffects 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: appBar
    property bool elevated: true
    property alias content: layout.data
    property real appBarHeight: 64
    height: appBarHeight
    width: parent ? parent.width : 640
    color: MaterialPalette.surface
    border.color: MaterialPalette.outline
    border.width: 1
    radius: 0
    layer.enabled: elevated
    layer.effect: DropShadow {
        anchors.fill: parent
        horizontalOffset: 0
        verticalOffset: elevated ? 4 : 0
        radius: elevated ? 12 : 0
        samples: 16
        color: "#22000000"
    }

    RowLayout {
        id: layout
        anchors.fill: parent
        anchors.margins: 14
        spacing: 16
    }
}
