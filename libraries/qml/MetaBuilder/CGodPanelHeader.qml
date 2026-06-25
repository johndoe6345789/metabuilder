import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "header_god_panel"
    Accessible.role: Accessible.Heading
    Accessible.name: "God Panel"
    property var configCounts: ({})
    property bool isDark: false
    signal navigateLevel(int level)

    readonly property color surfaceContainerHigh:
        isDark ? Qt.rgba(1, 1, 1, 0.08)
               : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color outlineVariant:
        isDark ? Qt.rgba(1, 1, 1, 0.06)
               : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    implicitHeight: headerCol.implicitHeight + 40
    radius: 16; clip: true
    color: surfaceContainerHigh
    border.width: 1; border.color: outlineVariant

    Rectangle {
        anchors.fill: parent; radius: parent.radius
        gradient: Gradient {
            GradientStop {
                position: 0.0
                color: root.isDark
                    ? Qt.rgba(0.39, 0.4, 0.95, 0.04)
                    : Qt.rgba(0.30, 0.40, 0.90, 0.08)
            }
            GradientStop { position: 1.0; color: "transparent" }
        }
    }

    ColumnLayout {
        id: headerCol
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 20; spacing: 14
        RowLayout {
            Layout.fillWidth: true; spacing: 12
            CText {
                text: "God Panel"
                font.pixelSize: 28
                font.weight: Font.Bold
                font.letterSpacing: -0.5
                color: root.onSurface
            }
            CBadge { text: "Level 4"; variant: "primary" }
            CStatusBadge { status: "success"; text: "Active" }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Level 1"; variant: "ghost"
                size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Navigate to Level 1"
                Keys.onReturnPressed: root.navigateLevel(1)
                Keys.onSpacePressed: root.navigateLevel(1)
                onClicked: root.navigateLevel(1)
            }
            CButton {
                text: "Level 2"; variant: "ghost"
                size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Navigate to Level 2"
                Keys.onReturnPressed: root.navigateLevel(2)
                Keys.onSpacePressed: root.navigateLevel(2)
                onClicked: root.navigateLevel(2)
            }
            CButton {
                text: "Level 3"; variant: "ghost"
                size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Navigate to Level 3"
                Keys.onReturnPressed: root.navigateLevel(3)
                Keys.onSpacePressed: root.navigateLevel(3)
                onClicked: root.navigateLevel(3)
            }
        }
        Flow {
            Layout.fillWidth: true; spacing: 8
            CChip {
                text: root.configCounts.schemas
                    + " Schemas"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.workflows
                    + " Workflows"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.luaScripts
                    + " Lua Scripts"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.packages
                    + " Packages"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.pages
                    + " Pages"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.components
                    + " Components"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.users
                    + " Users"
                variant: "primary"
            }
            CChip {
                text: root.configCounts.dbBackends
                    + " DB Backends"
                variant: "primary"
            }
        }
    }
}
