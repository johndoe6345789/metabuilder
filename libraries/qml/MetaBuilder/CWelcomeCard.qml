import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property string username: ""
    property int level: 1
    property string role: ""
    property bool isDark: false
    property bool loading: false

    signal refresh()

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    implicitHeight: welcomeRow.implicitHeight + 40
    radius: 16
    color: surfaceContainerHigh
    border.color: isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    border.width: 1

    RowLayout {
        id: welcomeRow
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // User avatar
        Rectangle {
            width: 56
            height: 56
            radius: 28
            color: Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.2 : 0.15)

            CText {
                anchors.centerIn: parent
                text: root.username
                    ? root.username.charAt(0).toUpperCase() : "?"
                font.pixelSize: 24
                font.weight: Font.Bold
                color: "#6366F1"
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            CText {
                text: "Welcome back, " + root.username
                font.pixelSize: 22
                font.weight: Font.Bold
                color: root.onSurface
            }
            CText {
                text: "Level " + root.level + " \u00b7 " + root.role
                font.pixelSize: 13
                color: root.onSurfaceVariant
            }
        }

        CButton {
            text: root.loading ? "Refreshing..." : "Refresh"
            variant: "ghost"
            size: "sm"
            enabled: !root.loading
            onClicked: root.refresh()
        }
    }
}
