import QtQuick 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: avatar
    property url source: ""
    property string initials: ""
    property color backgroundColor: MaterialPalette.secondaryContainer
    radius: width / 2
    color: backgroundColor
    border.color: MaterialPalette.outline
    border.width: 1
    implicitWidth: 40
    implicitHeight: 40

    Image {
        anchors.fill: parent
        anchors.margins: 4
        source: avatar.source
        visible: source.length > 0
        fillMode: Image.PreserveAspectCrop
        clip: true
    }

    Text {
        anchors.centerIn: parent
        visible: source.length === 0
        text: avatar.initials
        color: MaterialPalette.onSurface
        font.pixelSize: 16
        font.bold: true
    }
}
