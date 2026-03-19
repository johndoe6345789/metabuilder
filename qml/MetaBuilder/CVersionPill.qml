import QtQuick
import QmlComponents 1.0

Rectangle {
    id: root

    property string version: ""
    property color accent: "#6366F1"
    property color containerColor: "#1a1a2e"

    width: vLabel.implicitWidth + 24
    height: 28
    radius: 14
    color: containerColor

    CText {
        id: vLabel
        anchors.centerIn: parent
        text: "v" + root.version
        font.family: "monospace"
        font.pixelSize: 12
        color: root.accent
    }
}
