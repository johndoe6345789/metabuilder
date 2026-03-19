import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import MetaBuilder 1.0

Rectangle {
    id: godPanel
    color: Theme.background

    property int currentTab: 0

    // Config summary counts (would come from DBAL in production)
    property var configCounts: ({
        schemas: 39,
        workflows: 12,
        luaScripts: 8,
        packages: 62,
        pages: 27,
        components: 152,
        users: 3,
        snippets: 5,
        cssClasses: 44,
        dropdowns: 16,
        dbBackends: 14
    })

    property var tabModel: [
        { label: "Guide" },
        { label: "Packages" },
        { label: "Page Routes" },
        { label: "Components" },
        { label: "Users" },
        { label: "Schemas" },
        { label: "Workflows" },
        { label: "Lua Scripts" },
        { label: "Snippets" },
        { label: "CSS Classes" },
        { label: "Dropdowns" },
        { label: "Database" },
        { label: "Media" },
        { label: "Settings" }
    ]

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

    // Level data for the guide tab
    readonly property var levelData: [
        { level: "Level 1 - Public", role: "public", accentIndex: 0, desc: "Landing page, public content, registration. No authentication required. Read-only access to published pages and packages." },
        { level: "Level 2 - User", role: "user", accentIndex: 1, desc: "Authenticated user dashboard. Access to forum, gallery, guestbook, blog, profile. Personal content creation and community interaction." },
        { level: "Level 3 - Admin", role: "admin", accentIndex: 2, desc: "Django-style entity admin panel. CRUD operations on all entities, audit logs, analytics, watchtower monitoring. User management within tenant." },
        { level: "Level 4 - God Builder", role: "god", accentIndex: 3, desc: "Full builder cockpit (this panel). Schema editor, workflow designer, Lua scripting, page routing, component hierarchy, CSS classes, dropdown configs, database management, and system settings." },
        { level: "Level 5 - Super God", role: "supergod", accentIndex: 4, desc: "Cross-tenant platform control. Infrastructure management, deployment orchestration, multi-tenant provisioning, global configuration, and platform-wide observability." }
    ]

    // Config stat data for the guide tab
    readonly property var configStatData: [
        { label: "Schemas", value: configCounts.schemas.toString(), accent: accentBlue },
        { label: "Workflows", value: configCounts.workflows.toString(), accent: accentCyan },
        { label: "Lua Scripts", value: configCounts.luaScripts.toString(), accent: accentViolet },
        { label: "Packages", value: configCounts.packages.toString(), accent: accentBlue },
        { label: "Pages", value: configCounts.pages.toString(), accent: accentCyan },
        { label: "Components", value: configCounts.components.toString(), accent: accentViolet },
        { label: "CSS Classes", value: configCounts.cssClasses.toString(), accent: accentAmber },
        { label: "DB Backends", value: configCounts.dbBackends.toString(), accent: accentRose }
    ]

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 24
        spacing: 20

        // ════════════════════════════════════════════════════════
        // HEADER
        // ════════════════════════════════════════════════════════
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

        // ════════════════════════════════════════════════════════
        // TAB BAR
        // ════════════════════════════════════════════════════════
        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            tabs: tabModel
        }

        // ════════════════════════════════════════════════════════
        // TAB CONTENT
        // ════════════════════════════════════════════════════════
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
                            radius: 16
                            color: surfaceContainerHigh
                            border.width: 1
                            border.color: outlineVariant

                            ColumnLayout {
                                id: guideIntroCol
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.top: parent.top
                                anchors.margins: 24
                                spacing: 16

                                CText {
                                    text: "Builder Quick Reference"
                                    font.pixelSize: 22
                                    font.weight: Font.Bold
                                    color: onSurface
                                    Layout.fillWidth: true
                                }
                                CText {
                                    text: "MetaBuilder uses a 5-level permission and interface system. Each level unlocks progressively more powerful tools."
                                    font.pixelSize: 14
                                    wrapMode: Text.Wrap
                                    Layout.fillWidth: true
                                    color: onSurfaceVariant
                                    lineHeight: 1.5
                                }
                            }
                        }

                        // Level cards
                        CText {
                            text: "Access Levels"
                            font.pixelSize: 18
                            font.weight: Font.DemiBold
                            color: onSurface
                            Layout.fillWidth: true
                            Layout.topMargin: 4
                        }

                        Repeater {
                            model: levelData
                            delegate: CLevelReferenceCard {
                                Layout.fillWidth: true
                                levelName: modelData.level
                                role: modelData.role
                                description: modelData.desc
                                accent: levelAccents[modelData.accentIndex]
                                levelNumber: modelData.accentIndex + 1
                                isDark: godPanel.isDark
                            }
                        }

                        // Config summary section
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: configSummaryCol.implicitHeight + 48
                            Layout.topMargin: 8
                            radius: 16
                            color: surfaceContainerHigh
                            border.width: 1
                            border.color: outlineVariant

                            ColumnLayout {
                                id: configSummaryCol
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.top: parent.top
                                anchors.margins: 24
                                spacing: 16

                                CText {
                                    text: "Current Configuration"
                                    font.pixelSize: 16
                                    font.weight: Font.DemiBold
                                    color: onSurface
                                    Layout.fillWidth: true
                                }

                                GridLayout {
                                    Layout.fillWidth: true
                                    columns: Math.max(2, Math.min(4, Math.floor((parent.width + 12) / 180)))
                                    columnSpacing: 12
                                    rowSpacing: 12

                                    Repeater {
                                        model: configStatData
                                        delegate: CConfigStatCard {
                                            Layout.fillWidth: true
                                            label: modelData.label
                                            value: modelData.value
                                            accent: modelData.accent
                                            isDark: godPanel.isDark
                                        }
                                    }
                                }
                            }
                        }

                        // Philosophy alert
                        CAlert {
                            Layout.fillWidth: true
                            severity: "info"
                            text: "Philosophy: 95% JSON config, 5% TypeScript/C++ infrastructure. Entities, workflows, pages, and business logic are all declarative."
                        }

                        Item { Layout.preferredHeight: 16 }
                    }
                }
            }

            // ── 1 - Packages ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "PackageManager.qml" }
            }

            // ── 2 - Page Routes ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "PageRoutesManager.qml" }
            }

            // ── 3 - Components ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "ComponentHierarchyEditor.qml" }
            }

            // ── 4 - Users ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "UserManagement.qml" }
            }

            // ── 5 - Schemas ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "SchemaEditor.qml" }
            }

            // ── 6 - Workflows ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "WorkflowEditor.qml" }
            }

            // ── 7 - Lua Scripts ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "LuaEditor.qml" }
            }

            // ── 8 - Snippets ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "LuaEditor.qml" }
            }

            // ── 9 - CSS Classes ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "CssClassManager.qml" }
            }

            // ── 10 - Dropdowns ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "DropdownConfigManager.qml" }
            }

            // ── 11 - Database ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "DatabaseManager.qml" }
            }

            // ── 12 - Media Service ──
            Rectangle {
                color: "transparent"
                Loader { anchors.fill: parent; source: "MediaServicePanel.qml" }
            }

            // ── 13 - Settings (Theme + SMTP side by side) ──
            Rectangle {
                color: "transparent"

                ColumnLayout {
                    anchors.fill: parent
                    spacing: 20

                    CText {
                        text: "System Settings"
                        font.pixelSize: 22
                        font.weight: Font.Bold
                        color: onSurface
                        Layout.fillWidth: true
                    }
                    CText {
                        text: "Theme customization and SMTP configuration for outbound email."
                        font.pixelSize: 14
                        color: onSurfaceVariant
                        Layout.fillWidth: true
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 16

                        // Theme editor card
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
                                    CText { text: "Theme Editor"; font.pixelSize: 16; font.weight: Font.DemiBold; color: onSurface }
                                    CChip { text: "Visual"; variant: "info" }
                                }
                                Rectangle { Layout.fillWidth: true; height: 1; color: outlineVariant }
                                Loader { Layout.fillWidth: true; Layout.fillHeight: true; source: "ThemeEditor.qml" }
                            }
                        }

                        // SMTP config card
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
                                    CText { text: "SMTP Configuration"; font.pixelSize: 16; font.weight: Font.DemiBold; color: onSurface }
                                    CChip { text: "Email"; variant: "primary" }
                                }
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
