import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

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

    // ── Data ──
    property var levels: [
        { level: 1, name: "Public",    accent: "#94A3B8", desc: "Explore the platform. Component library, storybook, and public API.", tags: ["Landing", "Storybook", "Docs"] },
        { level: 2, name: "User",      accent: accentBlue, desc: "Your space. Dashboard, profile, forum, gallery, and packages.", tags: ["Dashboard", "Profile", "Forum", "Gallery"] },
        { level: 3, name: "Admin",     accent: accentCyan, desc: "Moderate and manage. User tables, audit logs, content tools.", tags: ["Users", "Audit", "Moderation"] },
        { level: 4, name: "God",       accent: accentViolet, desc: "The builder tier. Visual workflows, schema browser, 14 power tools.", tags: ["Workflows", "Schemas", "Pages", "14 tools"] },
        { level: 5, name: "Super God", accent: accentRose, desc: "Platform control. Multi-tenant management, system config.", tags: ["Tenants", "Config", "Promote"] }
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

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            // ════════════════════════════════════════════════════════
            // HERO
            // ════════════════════════════════════════════════════════
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 380
                color: "transparent"

                // Blue gradient wash
                Rectangle {
                    anchors.fill: parent
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: isDark ? Qt.rgba(0.39, 0.4, 0.95, 0.06) : Qt.rgba(0.30, 0.40, 0.90, 0.12) }
                        GradientStop { position: 0.7; color: isDark ? "transparent" : Qt.rgba(0.35, 0.45, 0.88, 0.04) }
                        GradientStop { position: 1.0; color: "transparent" }
                    }
                }

                ColumnLayout {
                    anchors.centerIn: parent
                    width: Math.min(parent.width - 80, 720)
                    spacing: 16

                    // Version pill — MD3 small chip
                    Rectangle {
                        Layout.alignment: Qt.AlignHCenter
                        width: vLabel.implicitWidth + 24
                        height: 28
                        radius: 14
                        color: primaryContainer

                        CText {
                            id: vLabel
                            anchors.centerIn: parent
                            text: "v" + platformVersion
                            font.family: "monospace"
                            font.pixelSize: 12
                            color: accentBlue
                        }
                    }

                    CText {
                        text: "MetaBuilder"
                        font.pixelSize: 52
                        font.weight: Font.Black
                        font.letterSpacing: -2
                        color: onSurface
                        Layout.alignment: Qt.AlignHCenter
                    }

                    CText {
                        text: "The universal platform for building data-driven applications."
                        font.pixelSize: 17
                        color: onSurfaceVariant
                        Layout.alignment: Qt.AlignHCenter
                    }

                    CText {
                        text: "95% JSON config  \u00B7  5% infrastructure  \u00B7  Desktop + Web + CLI"
                        font.pixelSize: 13
                        font.family: "monospace"
                        color: onSurfaceVariant
                        opacity: isDark ? 0.4 : 0.55
                        Layout.alignment: Qt.AlignHCenter
                    }

                    RowLayout {
                        Layout.alignment: Qt.AlignHCenter
                        Layout.topMargin: 20
                        spacing: 12

                        // MD3 filled button
                        Rectangle {
                            width: getStartedText.implicitWidth + 40
                            height: 44
                            radius: 22
                            color: accentBlue

                            CText {
                                id: getStartedText
                                anchors.centerIn: parent
                                text: "Get Started"
                                font.pixelSize: 14
                                font.weight: Font.DemiBold
                                color: "#ffffff"
                            }
                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appWindow.currentView = "login"
                            }
                        }

                        // MD3 outlined button
                        Rectangle {
                            width: sbText.implicitWidth + 32
                            height: 44
                            radius: 22
                            color: "transparent"
                            border.color: outline
                            border.width: 1

                            CText {
                                id: sbText
                                anchors.centerIn: parent
                                text: "Storybook"
                                font.pixelSize: 14
                                color: accentBlue
                            }
                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appWindow.currentView = "storybook"
                            }
                        }

                        Rectangle {
                            width: pkgText.implicitWidth + 32
                            height: 44
                            radius: 22
                            color: "transparent"
                            border.color: outline
                            border.width: 1

                            CText {
                                id: pkgText
                                anchors.centerIn: parent
                                text: "Packages"
                                font.pixelSize: 14
                                color: accentBlue
                            }
                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appWindow.currentView = "marketplace"
                            }
                        }
                    }
                }
            }

            // ════════════════════════════════════════════════════════
            // STATS
            // ════════════════════════════════════════════════════════
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 88
                color: surfaceContainer

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 60
                    anchors.rightMargin: 60
                    spacing: 0

                    Repeater {
                        model: [
                            { label: "USERS",     value: publicStats.users },
                            { label: "PACKAGES",  value: publicStats.packages },
                            { label: "WORKFLOWS", value: publicStats.workflows },
                            { label: "BACKENDS",  value: publicStats.backends }
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
                                    color: accentBlue
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

            // ════════════════════════════════════════════════════════
            // ACCESS LEVELS
            // ════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 24

                CText {
                    text: "Access Levels"
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    color: onSurface
                    Layout.alignment: Qt.AlignHCenter
                }

                GridLayout {
                    Layout.fillWidth: true
                    columns: Math.max(1, Math.min(5, Math.floor((parent.width + 12) / 220)))
                    columnSpacing: 12
                    rowSpacing: 12

                    Repeater {
                        model: levels
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 190
                            radius: 16
                            clip: true
                            color: lvlMA.containsMouse ? surfaceContainerHighest : surfaceContainerHigh
                            border.color: lvlMA.containsMouse ? modelData.accent : outlineVariant
                            border.width: 1

                            Behavior on color { ColorAnimation { duration: 200 } }
                            Behavior on border.color { ColorAnimation { duration: 200 } }

                            MouseArea {
                                id: lvlMA
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    var views = ["frontpage", "dashboard", "admin", "god-panel", "supergod"]
                                    if (modelData.level <= appWindow.currentLevel)
                                        appWindow.currentView = views[modelData.level - 1]
                                    else
                                        appWindow.currentView = "login"
                                }
                            }

                            ColumnLayout {
                                id: lvlContent
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 6

                                RowLayout {
                                    spacing: 10

                                    // MD3 small badge
                                    Rectangle {
                                        width: 28
                                        height: 28
                                        radius: 8
                                        color: Qt.rgba(modelData.accent.r, modelData.accent.g, modelData.accent.b, isDark ? 0.2 : 0.15)

                                        CText {
                                            anchors.centerIn: parent
                                            text: modelData.level.toString()
                                            font.pixelSize: 12
                                            font.weight: Font.Bold
                                            color: modelData.accent
                                        }
                                    }

                                    CText {
                                        text: modelData.name
                                        font.pixelSize: 16
                                        font.weight: Font.DemiBold
                                        color: onSurface
                                    }

                                    Item { Layout.fillWidth: true }

                                    CText {
                                        visible: modelData.level > appWindow.currentLevel
                                        text: "\uD83D\uDD12"
                                        font.pixelSize: 14
                                        opacity: isDark ? 0.3 : 0.4
                                    }
                                }

                                CText {
                                    text: modelData.desc
                                    font.pixelSize: 13
                                    wrapMode: Text.Wrap
                                    Layout.fillWidth: true
                                    color: onSurfaceVariant
                                    lineHeight: 1.4
                                }

                                Item { Layout.fillHeight: true }

                                Flow {
                                    Layout.fillWidth: true
                                    spacing: 6

                                    Repeater {
                                        model: modelData.tags
                                        Rectangle {
                                            width: tText.implicitWidth + 16
                                            height: 24
                                            radius: 8
                                            color: Qt.rgba(
                                                levels[index].accent.r,
                                                levels[index].accent.g,
                                                levels[index].accent.b,
                                                isDark ? 0.12 : 0.10)

                                            CText {
                                                id: tText
                                                anchors.centerIn: parent
                                                text: modelData
                                                font.pixelSize: 11
                                                font.weight: Font.Medium
                                                color: levels[index].accent
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ════════════════════════════════════════════════════════
            // TECH STACK
            // ════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 24

                CText {
                    text: "Stack"
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    color: onSurface
                    Layout.alignment: Qt.AlignHCenter
                }

                GridLayout {
                    Layout.fillWidth: true
                    columns: Math.max(1, Math.min(3, Math.floor((parent.width + 12) / 260)))
                    columnSpacing: 12
                    rowSpacing: 12

                    Repeater {
                        model: techStack
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 72
                            radius: 12
                            color: surfaceContainerHigh
                            border.color: outlineVariant
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 14
                                spacing: 12

                                Rectangle {
                                    width: 4
                                    height: 36
                                    radius: 2
                                    color: modelData.accent
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 3

                                    CText {
                                        text: modelData.name
                                        font.pixelSize: 14
                                        font.weight: Font.DemiBold
                                        color: onSurface
                                    }
                                    CText {
                                        text: modelData.desc
                                        font.pixelSize: 12
                                        color: onSurfaceVariant
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ════════════════════════════════════════════════════════
            // STATUS
            // ════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    text: "Status"
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    color: onSurface
                    Layout.alignment: Qt.AlignHCenter
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 10

                    Repeater {
                        model: services
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 56
                            radius: 12
                            color: surfaceContainerHigh
                            border.color: outlineVariant
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 14
                                anchors.rightMargin: 14
                                spacing: 10

                                Rectangle {
                                    width: 8
                                    height: 8
                                    radius: 4
                                    color: modelData.status === "online" ? accentBlue :
                                           modelData.status === "standby" ? accentAmber : accentRose
                                }

                                CText {
                                    text: modelData.name
                                    font.pixelSize: 13
                                    color: onSurface
                                    Layout.fillWidth: true
                                }

                                CText {
                                    text: modelData.status
                                    font.pixelSize: 11
                                    font.family: "monospace"
                                    color: modelData.status === "online" ? accentBlue :
                                           modelData.status === "standby" ? accentAmber : accentRose
                                }
                            }
                        }
                    }
                }
            }

            // ════════════════════════════════════════════════════════
            // QUICK LOGIN
            // ════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    text: "Quick Access"
                    font.pixelSize: 22
                    font.weight: Font.Bold
                    color: onSurface
                    Layout.alignment: Qt.AlignHCenter
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 10

                    Repeater {
                        model: [
                            { user: "demo",  pass: "demo",     label: "User",      level: 2, accent: accentBlue },
                            { user: "admin", pass: "admin",    label: "Admin",     level: 3, accent: accentCyan },
                            { user: "god",   pass: "god123",   label: "God",       level: 4, accent: accentViolet },
                            { user: "super", pass: "super123", label: "Super God", level: 5, accent: accentRose }
                        ]
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 60
                            radius: 16
                            color: cMA.containsMouse ? surfaceContainerHighest : surfaceContainerHigh
                            border.color: cMA.containsMouse ? modelData.accent : outlineVariant
                            border.width: 1

                            Behavior on color { ColorAnimation { duration: 150 } }
                            Behavior on border.color { ColorAnimation { duration: 150 } }

                            MouseArea {
                                id: cMA
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appWindow.login(modelData.user, modelData.pass)
                            }

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 14
                                anchors.rightMargin: 14
                                spacing: 12

                                Rectangle {
                                    width: 32
                                    height: 32
                                    radius: 10
                                    color: Qt.rgba(modelData.accent.r, modelData.accent.g, modelData.accent.b, isDark ? 0.2 : 0.15)

                                    CText {
                                        anchors.centerIn: parent
                                        text: modelData.level.toString()
                                        font.pixelSize: 13
                                        font.weight: Font.Bold
                                        color: modelData.accent
                                    }
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 1

                                    CText {
                                        text: modelData.label
                                        font.pixelSize: 14
                                        font.weight: Font.DemiBold
                                        color: onSurface
                                    }
                                    CText {
                                        text: modelData.user + " / " + modelData.pass
                                        font.pixelSize: 11
                                        font.family: "monospace"
                                        color: onSurfaceVariant
                                    }
                                }

                                CText {
                                    text: "\u2192"
                                    font.pixelSize: 18
                                    color: onSurfaceVariant
                                    opacity: cMA.containsMouse ? 1.0 : 0.3
                                    Behavior on opacity { NumberAnimation { duration: 150 } }
                                }
                            }
                        }
                    }
                }
            }

            // ════════════════════════════════════════════════════════
            // FOOTER
            // ════════════════════════════════════════════════════════
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
