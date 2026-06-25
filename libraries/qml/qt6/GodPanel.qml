import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "config/GodPanelConfig.js"
    as GodPanelConfig

Rectangle {
    id: godPanel
    color: Theme.background
    objectName: "view_god_panel"
    Accessible.role: Accessible.Pane
    Accessible.name: "God Panel"

    property int currentTab: 0
    property var configCounts: ({
        schemas: 39, workflows: 12,
        luaScripts: 8, packages: 62,
        pages: 27, components: 152,
        users: 3, snippets: 5,
        cssClasses: 44, dropdowns: 16,
        dbBackends: 14
    })

    property var tabModel: []
    property var levelData: []
    property var configStatData: []
    property var tabSources: []

    readonly property bool isDark:
        Theme.mode === "dark"
    readonly property color accentBlue:
        "#6366F1"
    readonly property color accentCyan:
        "#06B6D4"
    readonly property color accentViolet:
        "#8B5CF6"
    readonly property color accentAmber:
        "#F59E0B"
    readonly property color accentRose:
        "#F43F5E"
    readonly property var levelAccents: [
        "#94A3B8", accentBlue, accentCyan,
        accentViolet, accentRose
    ]

    Component.onCompleted: {
        var tabs = GodPanelConfig.loadTabs()
        tabModel = tabs
        var sources = []
        for (var i = 0; i < tabs.length; i++)
            sources.push(tabs[i].source || "")
        tabSources = sources
        levelData = GodPanelConfig.loadLevels()
        var palette = {
            accentBlue: accentBlue,
            accentCyan: accentCyan,
            accentViolet: accentViolet,
            accentAmber: accentAmber,
            accentRose: accentRose
        }
        configStatData =
            GodPanelConfig.resolveConfigStats(
                GodPanelConfig.loadConfigStats(),
                configCounts, palette)
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 24; spacing: 20

        CGodPanelHeader {
            Layout.fillWidth: true
            configCounts:
                godPanel.configCounts
            isDark: godPanel.isDark
            onNavigateLevel: function(level) {
                if (level === 1)
                    appWindow.currentView
                        = "frontpage"
                else if (level === 2)
                    appWindow.currentView
                        = "dashboard"
                else if (level === 3)
                    appWindow.currentView
                        = "admin"
            }
        }

        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged:
                currentTab = currentIndex
            tabs: tabModel
            Accessible.role: Accessible.PageTabList
            Accessible.name: "God Panel tabs"
        }

        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            CGodPanelGuideTab {
                levelData: godPanel.levelData
                configStatData:
                    godPanel.configStatData
                levelAccents:
                    godPanel.levelAccents
                isDark: godPanel.isDark
            }

            Repeater {
                model: 12
                delegate: Rectangle {
                    color: "transparent"
                    Loader {
                        anchors.fill: parent
                        source:
                            (tabSources.length
                                > index + 1)
                            ? tabSources[index + 1]
                            : ""
                    }
                }
            }

            CGodPanelSettingsTab {
                isDark: godPanel.isDark
            }
        }
    }
}
