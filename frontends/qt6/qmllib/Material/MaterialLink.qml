import QtQuick 2.15

import "MaterialPalette.qml" as MaterialPalette

Text {
    id: link
    property alias url: mouseArea.url
    property string href: ""
    property color hoverColor: MaterialPalette.primary
    color: MaterialPalette.primary
    font.pixelSize: 14
    font.bold: false
    textDecoration: "underline"
    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onEntered: link.color = hoverColor
        onExited: link.color = MaterialPalette.primary
        onClicked: {
            if (href.length > 0) Qt.openUrlExternally(href)
        }
    }
}
