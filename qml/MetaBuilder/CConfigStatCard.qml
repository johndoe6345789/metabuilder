import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "card_config_stat"
    Accessible.role: Accessible.StaticText
    Accessible.name: label + ": " + value

    property string label: ""
    property string value: ""
    property color accent: "#6366F1"
    property bool isDark: false

    // MD3 tonal surfaces
    readonly property color surfaceContainer: isDark
        ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurfaceVariant: Theme.textSecondary

    implicitHeight: 64
    radius: 12
    color: surfaceContainer
    border.width: 1
    border.color: outlineVariant

    RowLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 10

        Rectangle {
            width: 4
            height: 32
            radius: 2
            color: root.accent
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2

            CText {
                text: root.value
                font.pixelSize: 20
                font.weight: Font.Bold
                font.family: "monospace"
                color: root.accent
            }
            CText {
                text: root.label
                font.pixelSize: 11
                font.weight: Font.Medium
                color: root.onSurfaceVariant
            }
        }
    }
}
