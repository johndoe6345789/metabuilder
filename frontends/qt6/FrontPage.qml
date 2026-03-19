import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    DBALProvider { id: dbal }

    property bool dbalOnline: dbal.connected
    property string platformVersion: "0.9.1"
    property var publicStats: ({ users: "1,247", packages: "62", workflows: "152", backends: "14" })

    function loadPlatformStatus() {
        dbal.ping(function(success) {
            if (success) {
                dbal.execute("core/version", {}, function(r, e) { if (r && r.version) platformVersion = r.version })
                dbal.execute("core/stats", {}, function(r, e) {
                    if (r) publicStats = {
                        users: r.totalUsers || publicStats.users,
                        packages: r.totalPackages || publicStats.packages,
                        workflows: r.totalWorkflows || publicStats.workflows,
                        backends: r.totalBackends || publicStats.backends
                    }
                })
            }
        })
    }

    Component.onCompleted: loadPlatformStatus()

    // MD3-inspired palette
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color accentBlue: "#6366F1"
    readonly property color accentCyan: "#06B6D4"
    readonly property color accentViolet: "#8B5CF6"
    readonly property color accentAmber: "#F59E0B"
    readonly property color accentRose: "#F43F5E"

    // MD3 tonal surfaces
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    // Data models
    property var levels: [
        { level: 1, name: "Guest",     accent: "#94A3B8", desc: "Explore the platform. Component library, storybook, and public API.", tags: ["Landing", "Storybook", "Docs"] },
        { level: 2, name: "User",      accent: accentBlue, desc: "Your space. Dashboard, profile, forum, gallery, and packages.", tags: ["Dashboard", "Profile", "Forum", "Gallery"] },
        { level: 3, name: "Moderator", accent: accentCyan, desc: "Community management. Moderate content, manage reports, user warnings.", tags: ["Moderation", "Reports", "Warnings"] },
        { level: 4, name: "Admin",     accent: accentAmber, desc: "System administration. User tables, audit logs, entity management.", tags: ["Users", "Audit", "Entities", "Config"] },
        { level: 5, name: "God",       accent: accentViolet, desc: "The builder tier. Visual workflows, schema browser, 14 power tools.", tags: ["Workflows", "Schemas", "Pages", "14 tools"] },
        { level: 6, name: "Super God", accent: accentRose, desc: "Platform control. Multi-tenant management, system overrides.", tags: ["Tenants", "Config", "Promote"] }
    ]

    property var techStack: [
        { name: "Qt6 / QML",       desc: "Native desktop frontend",            accent: accentBlue },
        { name: "Next.js",         desc: "React web frontend",                 accent: accentCyan },
        { name: "C++ DBAL",        desc: "14-backend database abstraction",    accent: accentViolet },
        { name: "JSON Workflows",  desc: "152 node types, visual DAG editor",  accent: accentAmber },
        { name: "C++ CLI",         desc: "Headless command interface",          accent: "#94A3B8" },
        { name: "Docker",          desc: "One-command stack deployment",        accent: accentCyan }
    ]

    property var services: [
        { name: "DBAL Daemon",     status: dbalOnline ? "online" : "offline" },
        { name: "PostgreSQL",      status: "standby" },
        { name: "Redis Cache",     status: "standby" },
        { name: "Workflow Engine", status: dbalOnline ? "online" : "offline" },
        { name: "Media Service",   status: "standby" }
    ]

    property var quickCreds: [
        { user: "demo",  pass: "demo",     label: "User",      level: 2, accent: accentBlue },
        { user: "mod",   pass: "mod",      label: "Moderator", level: 3, accent: accentCyan },
        { user: "admin", pass: "admin",    label: "Admin",     level: 4, accent: accentAmber },
        { user: "god",   pass: "god123",   label: "God",       level: 5, accent: accentViolet },
        { user: "super", pass: "super123", label: "Super God", level: 6, accent: accentRose }
    ]

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 8 }

            // Hero
            CHeroSection {
                Layout.fillWidth: true
                Layout.preferredHeight: 400
                platformVersion: root.platformVersion
                isDark: root.isDark
                onGetStarted: appWindow.currentView = "login"
                onOpenStorybook: appWindow.currentView = "storybook"
                onOpenPackages: appWindow.currentView = "marketplace"
            }

            // Stats
            CStatsStrip {
                Layout.fillWidth: true
                stats: root.publicStats
                accentColor: accentBlue
                isDark: root.isDark
            }

            // Access Levels
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 24

                CText {
                    text: "Access Levels"
                    font.pixelSize: 22; font.weight: Font.Bold
                    color: onSurface
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                }

                GridLayout {
                    Layout.fillWidth: true
                    columns: Math.max(1, Math.min(5, Math.floor((parent.width + 12) / 220)))
                    columnSpacing: 12; rowSpacing: 12

                    Repeater {
                        model: levels
                        delegate: CLevelCard {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 190
                            level: modelData.level
                            name: modelData.name
                            accent: modelData.accent
                            desc: modelData.desc
                            tags: modelData.tags
                            locked: modelData.level > appWindow.currentLevel
                            isDark: root.isDark
                            onClicked: {
                                var views = ["frontpage", "dashboard", "admin", "god-panel", "supergod"]
                                if (modelData.level <= appWindow.currentLevel)
                                    appWindow.currentView = views[modelData.level - 1]
                                else
                                    appWindow.currentView = "login"
                            }
                        }
                    }
                }
            }

            // Tech Stack
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 24

                CText {
                    text: "Stack"
                    font.pixelSize: 22; font.weight: Font.Bold
                    color: onSurface
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                }

                GridLayout {
                    Layout.fillWidth: true
                    columns: Math.max(1, Math.min(3, Math.floor((parent.width + 12) / 260)))
                    columnSpacing: 12; rowSpacing: 12

                    Repeater {
                        model: techStack
                        delegate: CTechCard {
                            Layout.fillWidth: true
                            name: modelData.name
                            desc: modelData.desc
                            accent: modelData.accent
                            isDark: root.isDark
                        }
                    }
                }
            }

            // Status
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    text: "Status"
                    font.pixelSize: 22; font.weight: Font.Bold
                    color: onSurface
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 10

                    Repeater {
                        model: services
                        delegate: CServiceStatus {
                            Layout.fillWidth: true
                            name: modelData.name
                            status: modelData.status
                            isDark: root.isDark
                        }
                    }
                }
            }

            // Quick Access
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    text: "Quick Access"
                    font.pixelSize: 22; font.weight: Font.Bold
                    color: onSurface
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 10

                    Repeater {
                        model: quickCreds
                        delegate: CQuickLoginCard {
                            Layout.fillWidth: true
                            username: modelData.user
                            password: modelData.pass
                            label: modelData.label
                            level: modelData.level
                            accent: modelData.accent
                            isDark: root.isDark
                            onLogin: appWindow.login(modelData.user, modelData.pass)
                        }
                    }
                }
            }

            // Footer
            Item { Layout.preferredHeight: 48 }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 52
                color: surfaceContainer

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 40
                    anchors.rightMargin: 40

                    CText {
                        text: "\u00a9 2026 MetaBuilder"
                        font.pixelSize: 12
                        color: onSurfaceVariant
                    }

                    Item { Layout.fillWidth: true }

                    CText {
                        text: "Qt6 \u00B7 Next.js \u00B7 C++ \u00B7 JSON"
                        font.pixelSize: 12
                        font.family: "monospace"
                        color: onSurfaceVariant
                        opacity: isDark ? 0.4 : 0.5
                    }
                }
            }
        }
    }
}
