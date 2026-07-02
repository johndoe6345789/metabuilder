import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "tab_god_panel_settings"
    Accessible.role: Accessible.PageTab
    Accessible.name: "Settings"
    color: "transparent"

    required property bool isDark
    readonly property color surfaceContainerHigh:
        isDark ? Qt.rgba(1, 1, 1, 0.08)
               : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color outlineVariant:
        isDark ? Qt.rgba(1, 1, 1, 0.06)
               : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    ColumnLayout {
        anchors.fill: parent; spacing: 20

        CText {
            text: "System Settings"
            font.pixelSize: 22
            font.weight: Font.Bold
            color: onSurface
            Layout.fillWidth: true
        }
        CText {
            text: "Theme customization and SMTP"
                + " configuration for outbound"
                + " email."
            font.pixelSize: 14
            color: onSurfaceVariant
            Layout.fillWidth: true
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true; spacing: 16

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                radius: 16
                color: surfaceContainerHigh
                border.width: 1
                border.color: outlineVariant
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12
                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 10
                        CText {
                            text: "Theme Editor"
                            font.pixelSize: 16
                            font.weight: Font.DemiBold
                            color: onSurface
                        }
                        CChip {
                            text: "Visual"
                            chipColor: Theme.info
                        }
                    }
                    Rectangle {
                        Layout.fillWidth: true
                        height: 1
                        color: outlineVariant
                    }
                    Loader {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        source: "../../ThemeEditor.qml"
                    }
}
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                radius: 16
                color: surfaceContainerHigh
                border.width: 1
                border.color: outlineVariant
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12
                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 10
                        CText {
                            text: "SMTP Configuration"
                            font.pixelSize: 16
                            font.weight: Font.DemiBold
                            color: onSurface
                        }
                        CChip {
                            text: "Email"
                            chipColor: Theme.primary
                        }
                    }
                    Rectangle {
                        Layout.fillWidth: true
                        height: 1
                        color: outlineVariant
                    }
                    Loader {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        source: "../../SMTPConfigEditor.qml"
                    }
}
            }
        }
    }
}
