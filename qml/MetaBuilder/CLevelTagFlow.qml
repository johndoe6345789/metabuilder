import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Flow {
    id: root
    objectName: "flow_level_tags"
    Accessible.role: Accessible.Pane
    Accessible.name: "Level Tags"

    property var tags: []
    property color accent: "#94A3B8"
    property bool isDark: false

    Layout.fillWidth: true
    spacing: 6

    Repeater {
        model: root.tags
        Rectangle {
            width: tText.implicitWidth + 16
            height: 24
            radius: 8
            color: Qt.rgba(
                root.accent.r, root.accent.g,
                root.accent.b,
                root.isDark ? 0.12 : 0.10)
            Accessible.role: Accessible.StaticText
            Accessible.name: modelData

            CText {
                id: tText
                anchors.centerIn: parent
                text: modelData
                font.pixelSize: 11
                font.weight: Font.Medium
                color: root.accent
            }
        }
    }
}
