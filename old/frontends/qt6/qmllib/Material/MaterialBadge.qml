import QtQuick 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: badge
    property string text: ""
    property url iconSource: ""
    property bool accent: false
    property bool outlined: false
    property bool dense: false

    height: dense ? 24 : 28
    radius: height / 2
    implicitWidth: label.width + (iconSource.length > 0 ? 32 : 20)
    color: outlined ? "transparent" : (accent ? MaterialPalette.secondaryContainer : MaterialPalette.surfaceVariant)
    border.color: outlined ? MaterialPalette.secondary : "transparent"
    border.width: outlined ? 1 : 0

    RowLayout {
        id: wrapper
        anchors.fill: parent
        anchors.margins: 6
        spacing: iconSource.length > 0 ? 6 : 0
        Layout.alignment: Qt.AlignCenter

        Image {
            source: iconSource
            visible: iconSource.length > 0
            width: 16
            height: 16
            fillMode: Image.PreserveAspectFit
            opacity: 0.85
        }

        Text {
            id: label
            text: badge.text
            font.pixelSize: dense ? 12 : 14
            color: accent ? MaterialPalette.secondary : MaterialPalette.onSurface
        }
    }
}
