import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "config/GodPanelConfig.js" as GodPanelConfig

Rectangle {
    id: godPanel
    color: Theme.background

    property int currentTab: 0

    // Config summary counts (would come from DBAL in production)
    property var configCounts: ({
        schemas: 39, workflows: 12, luaScripts: 8, packages: 62,
        pages: 27, components: 152, users: 3, snippets: 5,
        cssClasses: 44, dropdowns: 16, dbBackends: 14
    })

    // ── Data loaded from JSON config ──
    property var tabModel: []
    property var levelData: []
    property var configStatData: []
    property var tabSources: []

    // ── MD3-inspired palette ──
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color accentBlue: "#6366F1"
    readonly property color accentCyan: "#06B6D4"
    readonly property color accentViolet: "#8B5CF6"
    readonly property color accentAmber: "#F59E0B"
    readonly property color accentRose: "#F43F5E"

    // MD3 tonal surfaces
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color surfaceContainerHigh: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color surfaceContainerHighest: isDark ? Qt.rgba(1, 1, 1, 0.12) : Qt.rgba(0.31, 0.31, 0.44, 0.14)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outline: Theme.border
    readonly property color outlineVariant: isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color primaryContainer: isDark ? Qt.rgba(accentBlue.r, accentBlue.g, accentBlue.b, 0.15) : Qt.rgba(accentBlue.r, accentBlue.g, accentBlue.b, 0.12)

    // Level accent colors for guide cards
    readonly property var levelAccents: [
        "#94A3B8", accentBlue, accentCyan, accentViolet, accentRose
    ]

    Component.onCompleted: {
        var tabs = GodPanelConfig.loadTabs()
        tabModel = tabs

        // Extract source paths for the Loader-based tabs
        var sources = []
        for (var i = 0; i < tabs.length; i++)
            sources.push(tabs[i].source || "")
        tabSources = sources

        levelData = GodPanelConfig.loadLevels()

        var rawStats = GodPanelConfig.loadConfigStats()
        var palette = { accentBlue: accentBlue, accentCyan: accentCyan,
                        accentViolet: accentViolet, accentAmber: accentAmber,
                        accentRose: accentRose }
        configStatData = GodPanelConfig.resolveConfigStats(rawStats, configCounts, palette)
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 24
        spacing: 20

        // ═══════════════════════════════════════════════════
        // HEADER
        // ═══════════════════════════════════════════════════
        CGodPanelHeader {
            Layout.fillWidth: true
            configCounts: godPanel.configCounts
            isDark: godPanel.isDark
            onNavigateLevel: function(level) {
                if (level === 1) appWindow.currentView = "frontpage"
                else if (level === 2) appWindow.currentView = "dashboard"
                else if (level === 3) appWindow.currentView = "admin"
            }
        }

        // ═══════════════════════════════════════════════════
        // TAB BAR
        // ═══════════════════════════════════════════════════
        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            tabs: tabModel
        }

        // ═══════════════════════════════════════════════════
        // TAB CONTENT
        // ═══════════════════════════════════════════════════
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            // ── 0 - Guide ──
            Rectangle {
                color: "transparent"
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    contentWidth: availableWidth

                    ColumnLayout {
                        width: parent.width
                        spacing: 20

                        // Intro section
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: guideIntroCol.implicitHeight + 48
                            radius: 16; color: surfaceContainerHigh
                            border.width: 1; border.color: outlineVariant

                            ColumnLayout {
                                id: guideIntroCol
                                anchors { left: parent.left; right: parent.right; top: parent.top; margins: 24 }
                                spacing: 16
                                CText { text: "Builder Quick Reference"; font.pixelSize: 22; font.weight: Font.Bold; color: onSurface; Layout.fillWidth: true }
                                CText { text: "MetaBuilder uses a 5-level permission and interface system. Each level unlocks progressively more powerful tools."; font.pixelSize: 14; wrapMode: Text.Wrap; Layout.fillWidth: true; color: onSurfaceVariant; lineHeight: 1.5 }
                            }
                        }

                        // Level cards
                        CText { text: "Access Levels"; font.pixelSize: 18; font.weight: Font.DemiBold; color: onSurface; Layout.fillWidth: true; Layout.topMargin: 4 }
                        Repeater {
                            model: levelData
                            delegate: CLevelReferenceCard {
                                Layout.fillWidth: true
                                levelName: modelData.level; role: modelData.role; description: modelData.desc
                                accent: levelAccents[modelData.accentIndex]; levelNumber: modelData.accentIndex + 1
                                isDark: godPanel.isDark
                            }
                        }

                        // Config summary section
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: configSummaryCol.implicitHeight + 48
                            Layout.topMargin: 8; radius: 16; color: surfaceContainerHigh
                            border.width: 1; border.color: outlineVariant

                            ColumnLayout {
                                id: configSummaryCol
                                anchors { left: parent.left; right: parent.right; top: parent.top; margins: 24 }
                                spacing: 16
                                CText { text: "Current Configuration"; font.pixelSize: 16; font.weight: Font.DemiBold; color: onSurface; Layout.fillWidth: true }
                                GridLayout {
                                    Layout.fillWidth: true
                                    columns: Math.max(2, Math.min(4, Math.floor((parent.width + 12) / 180)))
                                    columnSpacing: 12; rowSpacing: 12
                                    Repeater {
                                        model: configStatData
                                        delegate: CConfigStatCard {
                                            Layout.fillWidth: true
                                            label: modelData.label; value: modelData.value; accent: modelData.accent
                                            isDark: godPanel.isDark
                                        }
                                    }
                                }
                            }
                        }

                        CAlert { Layout.fillWidth: true; severity: "info"; text: "Philosophy: 95% JSON config, 5% TypeScript/C++ infrastructure. Entities, workflows, pages, and business logic are all declarative." }
                        Item { Layout.preferredHeight: 16 }
                    }
                }
            }

            // ── Tabs 1-12: data-driven Loader tabs ──
            Repeater {
                model: 12
                delegate: Rectangle {
                    color: "transparent"
                    Loader {
                        anchors.fill: parent
                        source: (tabSources.length > index + 1) ? tabSources[index + 1] : ""
                    }
                }
            }

            // ── 13 - Settings (Theme + SMTP side by side) ──
            Rectangle {
                color: "transparent"
                ColumnLayout {
                    anchors.fill: parent; spacing: 20
                    CText { text: "System Settings"; font.pixelSize: 22; font.weight: Font.Bold; color: onSurface; Layout.fillWidth: true }
                    CText { text: "Theme customization and SMTP configuration for outbound email."; font.pixelSize: 14; color: onSurfaceVariant; Layout.fillWidth: true }
                    RowLayout {
                        Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
                        Rectangle {
                            Layout.fillWidth: true; Layout.fillHeight: true; radius: 16
                            color: surfaceContainerHigh; border.width: 1; border.color: outlineVariant
                            ColumnLayout {
                                anchors.fill: parent; anchors.margins: 20; spacing: 12
                                RowLayout { Layout.fillWidth: true; spacing: 10; CText { text: "Theme Editor"; font.pixelSize: 16; font.weight: Font.DemiBold; color: onSurface } CChip { text: "Visual"; variant: "info" } }
                                Rectangle { Layout.fillWidth: true; height: 1; color: outlineVariant }
                                Loader { Layout.fillWidth: true; Layout.fillHeight: true; source: "ThemeEditor.qml" }
                            }
                        }
                        Rectangle {
                            Layout.fillWidth: true; Layout.fillHeight: true; radius: 16
                            color: surfaceContainerHigh; border.width: 1; border.color: outlineVariant
                            ColumnLayout {
                                anchors.fill: parent; anchors.margins: 20; spacing: 12
                                RowLayout { Layout.fillWidth: true; spacing: 10; CText { text: "SMTP Configuration"; font.pixelSize: 16; font.weight: Font.DemiBold; color: onSurface } CChip { text: "Email"; variant: "primary" } }
                                Rectangle { Layout.fillWidth: true; height: 1; color: outlineVariant }
                                Loader { Layout.fillWidth: true; Layout.fillHeight: true; source: "SMTPConfigEditor.qml" }
                            }
                        }
                    }
                }
            }
        }
    }
}
