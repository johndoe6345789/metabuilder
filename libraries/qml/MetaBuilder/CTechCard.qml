import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property string name: ""
    property string desc: ""
    property color accent: "#6366F1"
    property bool isDark: false

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    implicitHeight: 72
    radius: 12
    color: surfaceContainerHigh
    border.color: outlineVariant
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.margins: 14
        spacing: 12

        Rectangle {
            width: 4; height: 36; radius: 2
            color: root.accent
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 3

            CText {
                text: root.name
                font.pixelSize: 14
                font.weight: Font.DemiBold
                color: onSurface
            }
            CText {
                text: root.desc
                font.pixelSize: 12
                color: onSurfaceVariant
            }
        }
    }
}
