import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

RowLayout {
    id: root

    required property var stats
    property bool isDark: false

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurfaceVariant: Theme.textSecondary

    Layout.fillWidth: true
    spacing: 12

    Repeater {
        model: root.stats
        delegate: Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 72
            radius: 12
            color: root.surfaceContainerHigh
            border.color: root.outlineVariant
            border.width: 1

            ColumnLayout {
                anchors.centerIn: parent
                spacing: 4
                CText {
                    text: modelData.value
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    font.family: "monospace"
                    color: modelData.color
                    Layout.alignment: Qt.AlignHCenter
                }
                CText {
                    text: modelData.label
                    font.pixelSize: 9
                    font.family: "monospace"
                    font.letterSpacing: 1.5
                    color: root.onSurfaceVariant
                    Layout.alignment: Qt.AlignHCenter
                }
            }
        }
    }
}
