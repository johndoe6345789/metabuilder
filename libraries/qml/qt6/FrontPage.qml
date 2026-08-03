import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "qmllib/dbal"; import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/FrontPageLogic.js" as Logic
Rectangle {
    id: root; color: Theme.background
    objectName: "view_frontpage"
    Accessible.role: Accessible.Pane
    Accessible.name: "Front Page"
    DBALProvider { id: dbal }
    property bool dbalOnline: dbal.connected
    property string platformVersion: "0.9.1"
    property var publicStats: ({
        users: "1,247", packages: "62",
        workflows: "152", backends: "14" })
    readonly property bool isDark: Theme.mode === "dark"
    readonly property var accentMap: ({
        "blue": "#6366F1", "cyan": "#06B6D4",
        "violet": "#8B5CF6", "amber": "#F59E0B",
        "rose": "#F43F5E", "slate": "#94A3B8" })
    readonly property color surfaceContainer:
        isDark ? Qt.rgba(1, 1, 1, 0.05)
               : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant:
        Theme.textSecondary
    property var levels: []; property var techStack: []
    property var services: []
    Component.onCompleted: {
        Logic.loadFallbackData(root)
        Logic.loadPlatformStatus(root, dbal) }
    onDbalOnlineChanged: Logic.refreshServiceStatuses(root)
    ScrollView {
        anchors.fill: parent; clip: true; contentWidth: availableWidth
        ColumnLayout {
            width: parent.width; spacing: 0
            Item { Layout.preferredHeight: 8 }
            CHeroSection {
                Layout.fillWidth: true; Layout.preferredHeight: 400
                platformVersion: root.platformVersion; isDark: root.isDark
                onGetStarted: appWindow.currentView = "login"
                onOpenStorybook: appWindow.currentView = "storybook"
                onOpenPackages: appWindow.currentView = "marketplace"
            }
            CStatsStrip {
                Layout.fillWidth: true; stats: root.publicStats
                accentColor: accentMap["blue"]; isDark: root.isDark }
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48
                Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 24
                CText { text: "Access Levels"; font.pixelSize: 22
                    font.weight: Font.Bold; color: onSurface
                    Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter }
                GridLayout {
                    Layout.fillWidth: true; columnSpacing: 12; rowSpacing: 12
                    columns: Math.max(1, Math.min(5, Math.floor((parent.width +
                        12) / 220)))
                    Repeater {
                        model: levels
                        delegate: CLevelCard {
                            Layout.fillWidth: true; Layout.preferredHeight: 190
                            level: modelData.level; name: modelData.name
                            accent: modelData.accent
                                desc: modelData.desc; tags: modelData.tags
                            locked: modelData.level > appWindow.currentLevel
                                isDark: root.isDark
                            onClicked: Logic.onLevelClicked(modelData,
                                appWindow)
                        }
                    }
                }
            }
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48
                Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 24
                CText { text: "Stack"
                    font.pixelSize: 22; font.weight: Font.Bold
                    color: onSurface
                        Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter }
                GridLayout {
                    Layout.fillWidth: true; columnSpacing: 12; rowSpacing: 12
                    columns: Math.max(1, Math.min(3, Math.floor((parent.width +
                        12) / 260)))
                    Repeater { model: techStack
                        delegate: CTechCard { Layout.fillWidth: true
                            name: modelData.name; desc: modelData.desc
                            accent: modelData.accent; isDark: root.isDark } }
                }
            }
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48
                Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 20
                CText { text: "Status"
                    font.pixelSize: 22; font.weight: Font.Bold
                    color: onSurface
                        Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter }
                RowLayout {
                    Layout.fillWidth: true; spacing: 10
                    Repeater { model: services
                        delegate: CServiceStatus { Layout.fillWidth: true
                            name: modelData.name
                                status: modelData.status
                                isDark: root.isDark } }
                }
            }
            Item { Layout.preferredHeight: 48 }
            CFrontPageFooter { surfaceColor: surfaceContainer
                textColor: onSurfaceVariant; isDark: root.isDark }
        }
    }
}
