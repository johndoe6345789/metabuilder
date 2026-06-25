import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property string name: ""
    property string status: "offline"  // "online" | "standby" | "offline"
    property bool isDark: false

    readonly property color accentBlue: "#6366F1"
    readonly property color accentAmber: "#F59E0B"
    readonly property color accentRose: "#F43F5E"
    readonly property color statusColor: status === "online" ? accentBlue
                                       : status === "standby"
                                           ? accentAmber : accentRose
    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    implicitHeight: 56
    radius: 12
    color: surfaceContainerHigh
    border.color: outlineVariant
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 14
        anchors.rightMargin: 14
        spacing: 10

        Rectangle {
            width: 8; height: 8; radius: 4
            color: statusColor
        }

        CText {
            text: root.name
            font.pixelSize: 13
            color: onSurface
            Layout.fillWidth: true
        }

        CText {
            text: root.status
            font.pixelSize: 11
            font.family: "monospace"
            color: statusColor
        }
    }
}
