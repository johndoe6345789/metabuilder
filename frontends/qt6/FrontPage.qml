import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL connection ──
    DBALProvider { id: dbal }

    property bool dbalOnline: dbal.connected
    property string platformVersion: "0.9.1"
    property var publicStats: ({ users: "1,247", packages: "62", workflows: "152", backends: "14" })

    function loadPlatformStatus() {
        dbal.ping(function(success) {
            if (success) {
                dbal.execute("core/version", {}, function(result, error) {
                    if (result && result.version) platformVersion = result.version
                })
                dbal.execute("core/stats", {}, function(result, error) {
                    if (result) {
                        publicStats = {
                            users: result.totalUsers || publicStats.users,
                            packages: result.totalPackages || publicStats.packages,
                            workflows: result.totalWorkflows || publicStats.workflows,
                            backends: result.totalBackends || publicStats.backends
                        }
                    }
                })
            }
        })
    }

    Component.onCompleted: loadPlatformStatus()

    // ── Palette — cool/techy, theme-aware ──
    readonly property color accentBlue: "#6366F1"    // indigo-500
    readonly property color accentCyan: "#06B6D4"    // cyan-500
    readonly property color accentViolet: "#8B5CF6"  // violet-500
    readonly property color accentAmber: "#F59E0B"   // amber-500
    readonly property color accentRose: "#F43F5E"    // rose-500
    // Theme-aware surface colors (work in both light and dark)
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color subtleText: isDark ? Qt.rgba(1, 1, 1, 0.45) : Qt.rgba(0, 0, 0, 0.45)
    readonly property color subtleBorder: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color cardBg: isDark ? Qt.rgba(1, 1, 1, 0.03) : Qt.rgba(0, 0, 0, 0.02)

    // ── Level definitions ──
    property var levels: [
        {
            level: 1, name: "Public",    accent: "#94A3B8", // slate-400
            icon: "\u2302", // house
            desc: "Explore the platform. Browse the component library, storybook, and public API.",
            tags: ["Landing", "Storybook", "Docs"]
        },
        {
            level: 2, name: "User",      accent: "#6366F1", // indigo
            icon: "\u2605", // star
            desc: "Your space. Dashboard, profile, forum, gallery, and all installed packages.",
            tags: ["Dashboard", "Profile", "Forum", "Gallery"]
        },
        {
            level: 3, name: "Admin",     accent: "#06B6D4", // cyan
            icon: "\u2699", // gear
            desc: "Moderate and manage. User tables, audit logs, content moderation tools.",
            tags: ["Users", "Audit", "Moderation"]
        },
        {
            level: 4, name: "God",       accent: "#8B5CF6", // violet
            icon: "\u26A1", // lightning
            desc: "The builder tier. Visual workflow canvas, schema browser, page builder, 14 power tools.",
            tags: ["Workflows", "Schemas", "Pages", "14 tools"]
        },
        {
            level: 5, name: "Super God", accent: "#F43F5E", // rose
            icon: "\u2B50", // star
            desc: "Platform control. Multi-tenant management, system config, god-level promotions.",
            tags: ["Tenants", "Config", "Promote"]
        }
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

            // ═══════════════════════════════════════════════════════════
            // HERO
            // ═══════════════════════════════════════════════════════════
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 360
                color: "transparent"

                // Subtle gradient — stronger in light mode for warmth
                Rectangle {
                    anchors.fill: parent
                    gradient: Gradient {
                        orientation: Gradient.Horizontal
                        GradientStop { position: 0.0; color: isDark ? Qt.rgba(0.39, 0.4, 0.95, 0.06) : Qt.rgba(0.30, 0.45, 0.90, 0.15) }
                        GradientStop { position: 0.5; color: isDark ? "transparent" : Qt.rgba(0.35, 0.55, 0.95, 0.06) }
                        GradientStop { position: 1.0; color: isDark ? Qt.rgba(0.55, 0.36, 0.96, 0.04) : Qt.rgba(0.50, 0.40, 0.92, 0.12) }
                    }
                }
                // Vertical blue wash in light mode
                Rectangle {
                    anchors.fill: parent
                    visible: !isDark
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: Qt.rgba(0.35, 0.50, 0.95, 0.10) }
                        GradientStop { position: 0.6; color: Qt.rgba(0.40, 0.55, 0.90, 0.04) }
                        GradientStop { position: 1.0; color: "transparent" }
                    }
                }

                // Top-down fade line
                Rectangle {
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: 1
                    color: subtleBorder
                }

                ColumnLayout {
                    anchors.centerIn: parent
                    width: Math.min(parent.width - 80, 720)
                    spacing: 16

                    // Version pill
                    Rectangle {
                        Layout.alignment: Qt.AlignHCenter
                        width: versionLabel.implicitWidth + 20
                        height: 24
                        radius: 12
                        color: Qt.rgba(0.39, 0.4, 0.95, 0.12)
                        border.color: Qt.rgba(0.39, 0.4, 0.95, 0.25)
                        border.width: 1

                        CText {
                            id: versionLabel
                            anchors.centerIn: parent
                            text: "v" + platformVersion
                            variant: "caption"
                            color: accentBlue
                            font.family: "monospace"
                        }
                    }

                    CText {
                        variant: "h1"
                        text: "MetaBuilder"
                        Layout.alignment: Qt.AlignHCenter
                        font.pixelSize: 48
                        font.weight: Font.Black
                        font.letterSpacing: -1.5
                    }

                    CText {
                        variant: "body1"
                        text: "The universal platform for building data-driven applications."
                        Layout.alignment: Qt.AlignHCenter
                        opacity: isDark ? 0.5 : 0.7
                        font.pixelSize: 16
                    }

                    CText {
                        variant: "body2"
                        text: "95% JSON config \u00B7 5% infrastructure \u00B7 Desktop + Web + CLI"
                        Layout.alignment: Qt.AlignHCenter
                        opacity: isDark ? 0.3 : 0.5
                        font.family: "monospace"
                        font.pixelSize: 13
                    }

                    RowLayout {
                        Layout.alignment: Qt.AlignHCenter
                        Layout.topMargin: 16
                        spacing: 10

                        CButton {
                            text: "Get Started"
                            variant: "primary"
                            onClicked: appWindow.currentView = "login"
                        }
                        CButton {
                            text: "Storybook"
                            variant: "ghost"
                            onClicked: appWindow.currentView = "storybook"
                        }
                        CButton {
                            text: "Packages"
                            variant: "ghost"
                            onClicked: appWindow.currentView = "marketplace"
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // STATS STRIP
            // ═══════════════════════════════════════════════════════════
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 80
                color: isDark ? cardBg : Qt.rgba(0.35, 0.50, 0.90, 0.07)

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
                                spacing: 8

                                CText {
                                    text: modelData.value
                                    font.pixelSize: 22
                                    font.weight: Font.Bold
                                    font.family: "monospace"
                                    color: accentBlue
                                }
                                CText {
                                    text: modelData.label
                                    variant: "caption"
                                    font.family: "monospace"
                                    font.pixelSize: 10
                                    font.letterSpacing: 1.5
                                    opacity: isDark ? 0.3 : 0.55
                                }
                            }

                            Rectangle {
                                visible: index < 3
                                anchors.right: parent.right
                                anchors.verticalCenter: parent.verticalCenter
                                width: 1
                                height: 28
                                color: subtleBorder
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // ACCESS LEVELS
            // ═══════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 24

                RowLayout {
                    Layout.alignment: Qt.AlignHCenter
                    spacing: 8
                    CText {
                        variant: "h3"
                        text: "Access Levels"
                        font.weight: Font.Bold
                    }
                    Rectangle {
                        width: 40
                        height: 2
                        radius: 1
                        color: accentBlue
                        Layout.alignment: Qt.AlignVCenter
                    }
                }

                // Level cards — horizontal strip
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    Repeater {
                        model: levels
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 180
                            radius: 8
                            color: cardBg
                            border.color: lvlMA.containsMouse ? modelData.accent : subtleBorder
                            border.width: 1

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
                                anchors.fill: parent
                                anchors.margins: 14
                                spacing: 6

                                // Header row: accent bar + level number + name
                                RowLayout {
                                    spacing: 8

                                    Rectangle {
                                        width: 3
                                        height: 20
                                        radius: 1.5
                                        color: modelData.accent
                                    }

                                    CText {
                                        text: "L" + modelData.level
                                        font.family: "monospace"
                                        font.pixelSize: 11
                                        font.bold: true
                                        color: modelData.accent
                                    }

                                    CText {
                                        variant: "subtitle1"
                                        text: modelData.name
                                        font.bold: true
                                    }

                                    Item { Layout.fillWidth: true }

                                    CText {
                                        visible: modelData.level > appWindow.currentLevel
                                        text: "\uD83D\uDD12"
                                        font.pixelSize: 12
                                        opacity: isDark ? 0.3 : 0.5
                                    }
                                }

                                CText {
                                    variant: "body2"
                                    text: modelData.desc
                                    wrapMode: Text.Wrap
                                    Layout.fillWidth: true
                                    opacity: isDark ? 0.45 : 0.65
                                    lineHeight: 1.4
                                    font.pixelSize: 12
                                }

                                Item { Layout.fillHeight: true }

                                // Tags — subtle, monospace
                                Flow {
                                    Layout.fillWidth: true
                                    spacing: 4

                                    Repeater {
                                        model: modelData.tags
                                        Rectangle {
                                            width: tagText.implicitWidth + 12
                                            height: 20
                                            radius: 4
                                            color: Qt.rgba(
                                                levels[index] ? parseInt(levels[index].accent.substr(1,2), 16) / 255 : 0.5,
                                                levels[index] ? parseInt(levels[index].accent.substr(3,2), 16) / 255 : 0.5,
                                                levels[index] ? parseInt(levels[index].accent.substr(5,2), 16) / 255 : 0.5,
                                                0.1)

                                            CText {
                                                id: tagText
                                                anchors.centerIn: parent
                                                text: modelData
                                                font.pixelSize: 10
                                                font.family: "monospace"
                                                opacity: 0.6
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // TECH STACK
            // ═══════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 24

                RowLayout {
                    Layout.alignment: Qt.AlignHCenter
                    spacing: 8
                    CText {
                        variant: "h3"
                        text: "Stack"
                        font.weight: Font.Bold
                    }
                    Rectangle {
                        width: 28
                        height: 2
                        radius: 1
                        color: accentViolet
                        Layout.alignment: Qt.AlignVCenter
                    }
                }

                GridLayout {
                    Layout.fillWidth: true
                    columns: 3
                    columnSpacing: 12
                    rowSpacing: 12

                    Repeater {
                        model: techStack
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 68
                            radius: 6
                            color: cardBg
                            border.color: subtleBorder
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 14
                                spacing: 12

                                Rectangle {
                                    width: 3
                                    height: 32
                                    radius: 1.5
                                    color: modelData.accent
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 2

                                    CText {
                                        text: modelData.name
                                        font.bold: true
                                        font.pixelSize: 13
                                    }
                                    CText {
                                        text: modelData.desc
                                        variant: "caption"
                                        font.pixelSize: 11
                                        opacity: isDark ? 0.4 : 0.6
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // STATUS
            // ═══════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                RowLayout {
                    Layout.alignment: Qt.AlignHCenter
                    spacing: 8
                    CText {
                        variant: "h3"
                        text: "Status"
                        font.weight: Font.Bold
                    }
                    Rectangle {
                        width: 36
                        height: 2
                        radius: 1
                        color: accentCyan
                        Layout.alignment: Qt.AlignVCenter
                    }
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 10

                    Repeater {
                        model: services
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 52
                            radius: 6
                            color: cardBg
                            border.color: subtleBorder
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12
                                anchors.rightMargin: 12
                                spacing: 8

                                Rectangle {
                                    width: 7
                                    height: 7
                                    radius: 3.5
                                    color: modelData.status === "online" ? accentBlue :
                                           modelData.status === "standby" ? accentAmber : accentRose
                                }

                                CText {
                                    text: modelData.name
                                    font.pixelSize: 12
                                    Layout.fillWidth: true
                                }

                                CText {
                                    text: modelData.status
                                    font.pixelSize: 10
                                    font.family: "monospace"
                                    color: modelData.status === "online" ? accentBlue :
                                           modelData.status === "standby" ? accentAmber : accentRose
                                    opacity: 0.7
                                }
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // QUICK LOGIN
            // ═══════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.topMargin: 48
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    text: "Quick Access"
                    variant: "h4"
                    Layout.alignment: Qt.AlignHCenter
                    font.weight: Font.Bold
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
                            Layout.preferredHeight: 56
                            radius: 6
                            color: credMA2.containsMouse ? Qt.rgba(accentBlue.r, accentBlue.g, accentBlue.b, 0.06) : cardBg
                            border.color: credMA2.containsMouse ? modelData.accent : subtleBorder
                            border.width: 1

                            Behavior on border.color { ColorAnimation { duration: 150 } }
                            Behavior on color { ColorAnimation { duration: 150 } }

                            MouseArea {
                                id: credMA2
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appWindow.login(modelData.user, modelData.pass)
                            }

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12
                                anchors.rightMargin: 12
                                spacing: 10

                                Rectangle {
                                    width: 3
                                    height: 24
                                    radius: 1.5
                                    color: modelData.accent
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 1

                                    CText {
                                        text: modelData.label
                                        font.bold: true
                                        font.pixelSize: 13
                                    }
                                    CText {
                                        text: modelData.user + " / " + modelData.pass
                                        font.pixelSize: 10
                                        font.family: "monospace"
                                        opacity: isDark ? 0.3 : 0.5
                                    }
                                }

                                CText {
                                    text: "\u2192"
                                    font.pixelSize: 16
                                    opacity: credMA2.containsMouse ? 0.8 : 0.2
                                    Behavior on opacity { NumberAnimation { duration: 150 } }
                                }
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // FOOTER
            // ═══════════════════════════════════════════════════════════
            Item { Layout.preferredHeight: 48 }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 48
                color: "transparent"

                Rectangle {
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: 1
                    color: subtleBorder
                }

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 40
                    anchors.rightMargin: 40

                    CText {
                        text: "\u00a9 2026 MetaBuilder"
                        font.pixelSize: 11
                        opacity: 0.25
                    }

                    Item { Layout.fillWidth: true }

                    CText {
                        text: "Qt6 \u00B7 Next.js \u00B7 C++ \u00B7 JSON"
                        font.pixelSize: 11
                        font.family: "monospace"
                        opacity: 0.2
                    }
                }
            }
        }
    }
}
