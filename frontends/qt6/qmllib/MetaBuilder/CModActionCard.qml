import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    required property var action
    property bool isDark: false

    readonly property color surfaceContainerHigh: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color outlineVariant: isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurfaceVariant: Theme.textSecondary

    Layout.fillWidth: true
    Layout.preferredHeight: 56
    radius: 12
    color: surfaceContainerHigh
    border.color: outlineVariant
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        Rectangle {
            width: 4
            height: 28
            radius: 2
            color: root.action.action === "Deleted" ? "#F43F5E" :
                   root.action.action === "Warned" ? "#F59E0B" :
                   root.action.action === "Muted" ? "#EF4444" :
                   "#22C55E"
        }

        CText {
            text: root.action.action
            font.pixelSize: 13
            font.weight: Font.DemiBold
        }
        CText {
            text: root.action.target
            font.pixelSize: 13
            font.family: "monospace"
            Layout.fillWidth: true
        }
        CText {
            text: root.action.time
            font.pixelSize: 11
            color: root.onSurfaceVariant
        }
    }
}
