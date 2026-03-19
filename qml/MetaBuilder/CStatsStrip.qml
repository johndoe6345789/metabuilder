import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var stats: ({ users: "0", packages: "0", workflows: "0",
        backends: "0" })
    property color accentColor: "#6366F1"
    property bool isDark: false

    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    implicitHeight: 88
    color: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 60
        anchors.rightMargin: 60
        spacing: 0

        Repeater {
            model: [
                { label: "USERS",     value: stats.users },
                { label: "PACKAGES",  value: stats.packages },
                { label: "WORKFLOWS", value: stats.workflows },
                { label: "BACKENDS",  value: stats.backends }
            ]
            delegate: Item {
                Layout.fillWidth: true
                Layout.fillHeight: true

                RowLayout {
                    anchors.centerIn: parent
                    spacing: 10

                    CText {
                        text: modelData.value
                        font.pixelSize: 24
                        font.weight: Font.Bold
                        font.family: "monospace"
                        color: root.accentColor
                    }
                    CText {
                        text: modelData.label
                        font.pixelSize: 10
                        font.family: "monospace"
                        font.letterSpacing: 2
                        color: onSurfaceVariant
                    }
                }

                Rectangle {
                    visible: index < 3
                    anchors.right: parent.right
                    anchors.verticalCenter: parent.verticalCenter
                    width: 1
                    height: 32
                    color: outlineVariant
                }
            }
        }
    }
}
