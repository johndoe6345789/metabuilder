import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root

    required property color accentCyan
    required property color onSurface
    required property color onSurfaceVariant

    Layout.fillWidth: true
    Layout.leftMargin: 24
    Layout.rightMargin: 24
    spacing: 8

    RowLayout {
        spacing: 12
        CText {
            text: "Moderator Tools"
            font.pixelSize: 26
            font.weight: Font.Bold
            color: root.onSurface
        }
        Rectangle {
            width: lvl.implicitWidth + 16
            height: 24
            radius: 12
            color: Qt.rgba(root.accentCyan.r, root.accentCyan.g,
                root.accentCyan.b, 0.15)
            CText {
                id: lvl
                anchors.centerIn: parent
                text: "L3"
                font.pixelSize: 11
                font.weight: Font.Bold
                font.family: "monospace"
                color: root.accentCyan
            }
        }
    }

    CText {
        text:
            "Manage reports, moderate content, and keep the community healthy."
        color: root.onSurfaceVariant
    }
}
