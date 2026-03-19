import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property string username: ""
    property string password: ""
    property string label: ""
    property int level: 1
    property color accent: "#6366F1"
    property bool isDark: false

    signal login()

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color surfaceContainerHighest: isDark
        ? Qt.rgba(1, 1, 1, 0.12) : Qt.rgba(0.31, 0.31, 0.44, 0.14)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    implicitHeight: 60
    radius: 16
    color: cMA.containsMouse ? surfaceContainerHighest : surfaceContainerHigh
    border.color: cMA.containsMouse ? accent : outlineVariant
    border.width: 1

    Behavior on color { ColorAnimation { duration: 150 } }
    Behavior on border.color { ColorAnimation { duration: 150 } }

    MouseArea {
        id: cMA
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.login()
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 14
        anchors.rightMargin: 14
        spacing: 12

        Rectangle {
            width: 32; height: 32; radius: 10
            color: Qt.rgba(accent.r, accent.g, accent.b, isDark ? 0.2 : 0.15)

            CText {
                anchors.centerIn: parent
                text: root.level.toString()
                font.pixelSize: 13
                font.weight: Font.Bold
                color: accent
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 1

            CText {
                text: root.label
                font.pixelSize: 14
                font.weight: Font.DemiBold
                color: onSurface
            }
            CText {
                text: root.username + " / " + root.password
                font.pixelSize: 11
                font.family: "monospace"
                color: onSurfaceVariant
            }
        }

        CText {
            text: "\u2192"
            font.pixelSize: 18
            color: onSurfaceVariant
            opacity: cMA.containsMouse ? 1.0 : 0.3
            Behavior on opacity { NumberAnimation { duration: 150 } }
        }
    }
}
