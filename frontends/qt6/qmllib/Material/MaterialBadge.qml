import QtQuick 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: badge
    property string text: ""
    property bool accent: false
    property bool outlined: false
    property bool dense: false

    height: dense ? 24 : 28
    radius: height / 2
    implicitWidth: label.width + 20
    color: outlined ? "transparent" : (accent ? MaterialPalette.secondaryContainer : MaterialPalette.surfaceVariant)
    border.color: outlined ? MaterialPalette.secondary : "transparent"
    border.width: outlined ? 1 : 0

    Text {
        id: label
        anchors.centerIn: parent
        text: badge.text
        font.pixelSize: dense ? 12 : 14
        color: accent ? MaterialPalette.secondary : MaterialPalette.onSurface
    }
}
