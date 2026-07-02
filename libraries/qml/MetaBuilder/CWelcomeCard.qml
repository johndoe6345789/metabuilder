import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property string username: ""
    property int    level:    1
    property string role:     ""
    property bool   isDark:   false
    property bool   loading:  false
    property string email:    ""

    signal refresh()

    readonly property var levelGradients: [
        { from: "#3b82f6", to: "#2563eb" },
        { from: "#22c55e", to: "#16a34a" },
        { from: "#f97316", to: "#ea580c" },
        { from: "#a855f7", to: "#9333ea" },
        { from: "#f59e0b", to: "#d97706" },
    ]
    readonly property var grad: levelGradients[Math.max(0,
        Math.min(level - 1, levelGradients.length - 1))]

    readonly property color surfaceBg: isDark
        ? Qt.rgba(1, 1, 1, 0.07) : Qt.rgba(0.98, 0.98, 1.0, 1.0)
    readonly property color borderCol: isDark
        ? Qt.rgba(1, 1, 1, 0.10) : Qt.rgba(0.0, 0.0, 0.0, 0.10)

    implicitHeight: welcomeRow.implicitHeight + 40
    radius: 16
    color: surfaceBg
    border.color: borderCol
    border.width: 1

    RowLayout {
        id: welcomeRow
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // Gradient avatar
        Rectangle {
            width: 64; height: 64; radius: 32
            gradient: Gradient {
                orientation: Gradient.Vertical
                GradientStop { position: 0.0; color: grad.from }
                GradientStop { position: 1.0; color: grad.to   }
            }

            Text {
                anchors.centerIn: parent
                text: root.username
                    ? root.username.charAt(0).toUpperCase() : "?"
                font.pixelSize: 26
                font.weight: Font.Bold
                color: "#ffffff"
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            CText {
                text: root.username
                font.pixelSize: 18
                font.weight: Font.Bold
                color: Theme.text
            }

            CText {
                visible: root.email !== ""
                text: root.email
                font.pixelSize: 12
                color: Theme.textSecondary
            }

            RowLayout {
                spacing: 6

                // Level badge
                Rectangle {
                    width: levelLabel.implicitWidth + 14
                    height: 22; radius: 11
                    color: grad.from

                    Text {
                        id: levelLabel
                        anchors.centerIn: parent
                        text: "Level " + root.level + " — " + root.role
                        font.pixelSize: 11
                        font.weight: Font.DemiBold
                        color: "#ffffff"
                    }
                }

                // Role outlined badge
                Rectangle {
                    width: roleLabel.implicitWidth + 14
                    height: 22; radius: 11
                    color: "transparent"
                    border.color: root.borderCol
                    border.width: 1.5

                    Text {
                        id: roleLabel
                        anchors.centerIn: parent
                        text: root.role
                        font.pixelSize: 11
                        color: Theme.textSecondary
                    }
                }
            }
        }

        CButton {
            text: root.loading ? "Refreshing…" : "Refresh"
            variant: "ghost"
            size: "sm"
            enabled: !root.loading
            onClicked: root.refresh()
        }
    }
}
