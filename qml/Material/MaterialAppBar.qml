import QtQuick
import QtQuick.Layouts

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

    RowLayout {
        id: layout
        anchors.fill: parent
        anchors.margins: 14
        spacing: 16
    }
}
