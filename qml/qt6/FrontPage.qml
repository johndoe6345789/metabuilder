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

    // MD3-inspired palette
    readonly property bool isDark: Theme.mode === "dark"
    readonly property var accentMap: ({
        "blue": "#6366F1", "cyan": "#06B6D4", "violet": "#8B5CF6",
        "amber": "#F59E0B", "rose": "#F43F5E", "slate": "#94A3B8"
    })
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    // Data models (loaded from JSON, updated by DBAL)
    property var levels: []
    property var techStack: []
    property var services: []
    property var quickCreds: []

    function loadJson(path) {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(path), false)
        xhr.send()
        return xhr.status === 200 ? JSON.parse(xhr.responseText) : null
    }

    function resolveAccent(key) { return accentMap[key] || key }

    function resolveStatus(key) {
        if (key === "dbal") return dbalOnline ? "online" : "offline"
        return key
    }

    function loadFallbackData() {
        var data = loadJson("config/frontpage-data.json")
        if (!data) return
        levels = data.levels.map(function(l) { l.accent = resolveAccent(l.accentKey); return l })
        techStack = data.techStack.map(function(t) { t.accent = resolveAccent(t.accentKey); return t })
        services = data.services.map(function(s) { s.status = resolveStatus(s.statusKey); return s })
        quickCreds = data.quickCreds.map(function(q) { q.accent = resolveAccent(q.accentKey); return q })
    }

    function refreshServiceStatuses() {
        if (services.length === 0) return
        var raw = loadJson("config/frontpage-data.json")
        if (!raw) return
        services = raw.services.map(function(s) { s.status = resolveStatus(s.statusKey); return s })
    }

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
            refreshServiceStatuses()
        })
    }

    Component.onCompleted: { loadFallbackData(); loadPlatformStatus() }
    onDbalOnlineChanged: refreshServiceStatuses()

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 8 }

            CHeroSection {
                Layout.fillWidth: true; Layout.preferredHeight: 400
                platformVersion: root.platformVersion; isDark: root.isDark
                onGetStarted: appWindow.currentView = "login"
                onOpenStorybook: appWindow.currentView = "storybook"
                onOpenPackages: appWindow.currentView = "marketplace"
            }

            CStatsStrip {
                Layout.fillWidth: true
                stats: root.publicStats; accentColor: accentMap["blue"]; isDark: root.isDark
            }

            // Access Levels
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48; Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 24
                CText { text: "Access Levels"; font.pixelSize: 22; font.weight: Font.Bold; color: onSurface; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }
                GridLayout {
                    Layout.fillWidth: true
                    columns: Math.max(1, Math.min(5, Math.floor((parent.width + 12) / 220)))
                    columnSpacing: 12; rowSpacing: 12
                    Repeater {
                        model: levels
                        delegate: CLevelCard {
                            Layout.fillWidth: true; Layout.preferredHeight: 190
                            level: modelData.level; name: modelData.name; accent: modelData.accent
                            desc: modelData.desc; tags: modelData.tags
                            locked: modelData.level > appWindow.currentLevel; isDark: root.isDark
                            onClicked: {
                                var views = ["frontpage", "dashboard", "admin", "god-panel", "supergod"]
                                appWindow.currentView = modelData.level <= appWindow.currentLevel ? views[modelData.level - 1] : "login"
                            }
                        }
                    }
                }
            }

            // Tech Stack
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48; Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 24
                CText { text: "Stack"; font.pixelSize: 22; font.weight: Font.Bold; color: onSurface; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }
                GridLayout {
                    Layout.fillWidth: true
                    columns: Math.max(1, Math.min(3, Math.floor((parent.width + 12) / 260)))
                    columnSpacing: 12; rowSpacing: 12
                    Repeater {
                        model: techStack
                        delegate: CTechCard { Layout.fillWidth: true; name: modelData.name; desc: modelData.desc; accent: modelData.accent; isDark: root.isDark }
                    }
                }
            }

            // Status
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48; Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 20
                CText { text: "Status"; font.pixelSize: 22; font.weight: Font.Bold; color: onSurface; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }
                RowLayout {
                    Layout.fillWidth: true; spacing: 10
                    Repeater {
                        model: services
                        delegate: CServiceStatus { Layout.fillWidth: true; name: modelData.name; status: modelData.status; isDark: root.isDark }
                    }
                }
            }

            // Quick Access
            ColumnLayout {
                Layout.fillWidth: true; Layout.topMargin: 48; Layout.leftMargin: 40; Layout.rightMargin: 40; spacing: 20
                CText { text: "Quick Access"; font.pixelSize: 22; font.weight: Font.Bold; color: onSurface; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }
                RowLayout {
                    Layout.fillWidth: true; spacing: 10
                    Repeater {
                        model: quickCreds
                        delegate: CQuickLoginCard {
                            Layout.fillWidth: true; username: modelData.user; password: modelData.pass
                            label: modelData.label; level: modelData.level; accent: modelData.accent
                            isDark: root.isDark
                            onLogin: appWindow.login(modelData.user, modelData.pass)
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 48 }

            Rectangle {
                Layout.fillWidth: true; Layout.preferredHeight: 52; color: surfaceContainer
                RowLayout {
                    anchors.fill: parent; anchors.leftMargin: 40; anchors.rightMargin: 40
                    CText { text: "\u00a9 2026 MetaBuilder"; font.pixelSize: 12; color: onSurfaceVariant }
                    Item { Layout.fillWidth: true }
                    CText { text: "Qt6 \u00B7 Next.js \u00B7 C++ \u00B7 JSON"; font.pixelSize: 12; font.family: "monospace"; color: onSurfaceVariant; opacity: isDark ? 0.4 : 0.5 }
                }
            }
        }
    }
}
