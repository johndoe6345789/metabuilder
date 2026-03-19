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

    // ── Level definitions ──
    property var levels: [
        {
            level: 1, name: "Public",    color: "#2196F3",
            desc: "Browse the platform, view public content, explore the component library and storybook.",
            features: ["Landing page", "Storybook", "Public API docs"]
        },
        {
            level: 2, name: "User",      color: "#4CAF50",
            desc: "Full access to your profile, comments, forum, gallery, guestbook, and installed packages.",
            features: ["Dashboard", "Profile", "Forum", "Gallery"]
        },
        {
            level: 3, name: "Admin",     color: "#FF9800",
            desc: "Manage users, moderate content, view audit logs, and access the admin panel.",
            features: ["User management", "Audit logs", "Moderation"]
        },
        {
            level: 4, name: "God",       color: "#9C27B0",
            desc: "Full builder access. Visual workflow editor, schema browser, page builder, 14 power tools.",
            features: ["Workflow editor", "Schema browser", "Page builder", "14 God tools"]
        },
        {
            level: 5, name: "Super God", color: "#FF5722",
            desc: "Multi-tenant control, platform-wide configuration, tenant creation, and system overrides.",
            features: ["Multi-tenant", "System config", "Tenant CRUD", "God promotion"]
        }
    ]

    // ── Tech stack items ──
    property var techStack: [
        { name: "Qt6 / QML",       desc: "Native desktop frontend" },
        { name: "Next.js / React", desc: "Web frontend" },
        { name: "C++ DBAL",        desc: "14-backend database layer" },
        { name: "JSON Workflows",  desc: "152 node types, visual DAG editor" },
        { name: "C++ CLI",         desc: "Headless command interface" },
        { name: "Docker Stack",    desc: "One-command deployment" }
    ]

    // ── Service status ──
    property var services: [
        { name: "DBAL Daemon",      status: dbalOnline ? "online" : "offline" },
        { name: "PostgreSQL",       status: "standby" },
        { name: "Redis Cache",      status: "standby" },
        { name: "Workflow Engine",  status: dbalOnline ? "online" : "offline" },
        { name: "Media Service",    status: "standby" }
    ]

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            // ═══════════════════════════════════════════════════════════
            // HERO SECTION
            // ═══════════════════════════════════════════════════════════
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 340
                color: "transparent"

                // Gradient background
                Rectangle {
                    anchors.fill: parent
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: Qt.rgba(Theme.primary.r || 0.13, Theme.primary.g || 0.59, Theme.primary.b || 0.95, 0.08) }
                        GradientStop { position: 0.5; color: Theme.background }
                        GradientStop { position: 1.0; color: Qt.rgba(Theme.success.r || 0.3, Theme.success.g || 0.69, Theme.success.b || 0.31, 0.05) }
                    }
                }

                ColumnLayout {
                    anchors.centerIn: parent
                    anchors.horizontalCenterOffset: 0
                    width: Math.min(parent.width - 80, 900)
                    spacing: 20

                    CText {
                        variant: "overline"
                        text: "METABUILDER PLATFORM v" + platformVersion
                        Layout.alignment: Qt.AlignHCenter
                        opacity: 0.6
                    }

                    CText {
                        variant: "h1"
                        text: "Build Anything, Visually"
                        Layout.alignment: Qt.AlignHCenter
                        font.pixelSize: 42
                        font.bold: true
                    }

                    CText {
                        variant: "body1"
                        text: "A universal platform for building data-driven applications.\n95% JSON configuration, 5% infrastructure code. One stack — desktop, web, and CLI."
                        wrapMode: Text.Wrap
                        Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter
                        opacity: 0.7
                        lineHeight: 1.5
                    }

                    RowLayout {
                        Layout.alignment: Qt.AlignHCenter
                        Layout.topMargin: 8
                        spacing: 12

                        CButton {
                            text: "Get Started"
                            variant: "primary"
                            onClicked: appWindow.currentView = "login"
                        }
                        CButton {
                            text: "View Storybook"
                            variant: "ghost"
                            onClicked: appWindow.currentView = "storybook"
                        }
                        CButton {
                            text: "Browse Packages"
                            variant: "ghost"
                            onClicked: appWindow.currentView = "marketplace"
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // STATS BAR
            // ═══════════════════════════════════════════════════════════
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 100
                color: Theme.paper

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 40
                    anchors.rightMargin: 40
                    spacing: 0

                    Repeater {
                        model: [
                            { label: "Users",     value: publicStats.users,     icon: "U" },
                            { label: "Packages",  value: publicStats.packages,  icon: "P" },
                            { label: "Workflows", value: publicStats.workflows, icon: "W" },
                            { label: "Backends",  value: publicStats.backends,  icon: "B" }
                        ]
                        delegate: Item {
                            Layout.fillWidth: true
                            Layout.fillHeight: true

                            ColumnLayout {
                                anchors.centerIn: parent
                                spacing: 4

                                CText {
                                    variant: "h2"
                                    text: modelData.value
                                    color: Theme.primary
                                    Layout.alignment: Qt.AlignHCenter
                                    font.bold: true
                                }
                                CText {
                                    variant: "caption"
                                    text: modelData.label
                                    Layout.alignment: Qt.AlignHCenter
                                    opacity: 0.6
                                }
                            }

                            // Divider between stats
                            Rectangle {
                                visible: index < 3
                                anchors.right: parent.right
                                anchors.verticalCenter: parent.verticalCenter
                                width: 1
                                height: 40
                                color: Theme.border
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // FIVE LEVELS OF POWER
            // ═══════════════════════════════════════════════════════════
            Item { Layout.preferredHeight: 40 }

            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    variant: "h3"
                    text: "Five Levels of Power"
                    Layout.alignment: Qt.AlignHCenter
                }
                CText {
                    variant: "body2"
                    text: "Each level unlocks new capabilities. Start as a visitor, rise to platform god."
                    Layout.alignment: Qt.AlignHCenter
                    opacity: 0.6
                }

                // Level cards grid — 3 across top, 2 across bottom
                GridLayout {
                    Layout.fillWidth: true
                    Layout.topMargin: 8
                    columns: 3
                    columnSpacing: 16
                    rowSpacing: 16

                    Repeater {
                        model: levels
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.minimumWidth: 200
                            Layout.preferredHeight: 200
                            radius: 8
                            color: Theme.paper
                            border.color: levelMA.containsMouse ? modelData.color : Theme.border
                            border.width: levelMA.containsMouse ? 2 : 1

                            Behavior on border.color { ColorAnimation { duration: 150 } }

                            MouseArea {
                                id: levelMA
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    if (modelData.level <= appWindow.currentLevel) {
                                        appWindow.currentView = levels[index].level === 1 ? "frontpage" :
                                            levels[index].level === 2 ? "dashboard" :
                                            levels[index].level === 3 ? "admin" :
                                            levels[index].level === 4 ? "god-panel" : "supergod"
                                    } else {
                                        appWindow.currentView = "login"
                                    }
                                }
                            }

                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 8

                                RowLayout {
                                    spacing: 8
                                    // Level badge
                                    Rectangle {
                                        width: 32
                                        height: 32
                                        radius: 16
                                        color: modelData.color

                                        CText {
                                            anchors.centerIn: parent
                                            text: modelData.level.toString()
                                            color: "#FFFFFF"
                                            font.bold: true
                                            font.pixelSize: 14
                                        }
                                    }

                                    CText {
                                        variant: "h4"
                                        text: modelData.name
                                    }

                                    Item { Layout.fillWidth: true }

                                    // Lock indicator
                                    CText {
                                        visible: modelData.level > appWindow.currentLevel
                                        text: "\uD83D\uDD12"
                                        font.pixelSize: 16
                                        opacity: 0.4
                                    }
                                }

                                CText {
                                    variant: "body2"
                                    text: modelData.desc
                                    wrapMode: Text.Wrap
                                    Layout.fillWidth: true
                                    opacity: 0.7
                                    lineHeight: 1.3
                                }

                                Item { Layout.fillHeight: true }

                                // Feature tags
                                Flow {
                                    Layout.fillWidth: true
                                    spacing: 6

                                    Repeater {
                                        model: modelData.features
                                        CChip {
                                            text: modelData
                                            color: levels[index].color
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
            Item { Layout.preferredHeight: 40 }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: techStackCol.implicitHeight + 80
                color: Theme.paper

                ColumnLayout {
                    id: techStackCol
                    anchors.fill: parent
                    anchors.margins: 40
                    spacing: 20

                    CText {
                        variant: "h3"
                        text: "Universal Platform"
                        Layout.alignment: Qt.AlignHCenter
                    }
                    CText {
                        variant: "body2"
                        text: "One codebase. Three frontends. Fourteen database backends. Zero compromises."
                        Layout.alignment: Qt.AlignHCenter
                        opacity: 0.6
                    }

                    GridLayout {
                        Layout.fillWidth: true
                        Layout.topMargin: 8
                        columns: 3
                        columnSpacing: 16
                        rowSpacing: 16

                        Repeater {
                            model: techStack
                            delegate: Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 80
                                radius: 8
                                color: Theme.surface || Theme.background
                                border.color: Theme.border
                                border.width: 1

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 14
                                    spacing: 4

                                    CText {
                                        variant: "subtitle1"
                                        text: modelData.name
                                        font.bold: true
                                    }
                                    CText {
                                        variant: "caption"
                                        text: modelData.desc
                                        opacity: 0.6
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // PLATFORM STATUS
            // ═══════════════════════════════════════════════════════════
            Item { Layout.preferredHeight: 40 }

            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                spacing: 20

                CText {
                    variant: "h3"
                    text: "Platform Status"
                    Layout.alignment: Qt.AlignHCenter
                }

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    Repeater {
                        model: services
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 64
                            radius: 8
                            color: Theme.paper
                            border.color: Theme.border
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 14
                                spacing: 10

                                // Status dot
                                Rectangle {
                                    width: 10
                                    height: 10
                                    radius: 5
                                    color: modelData.status === "online" ? "#4CAF50" :
                                           modelData.status === "standby" ? "#FF9800" : "#f44336"
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 2
                                    CText {
                                        variant: "body2"
                                        text: modelData.name
                                        font.bold: true
                                    }
                                    CText {
                                        variant: "caption"
                                        text: modelData.status
                                        color: modelData.status === "online" ? "#4CAF50" :
                                               modelData.status === "standby" ? "#FF9800" : "#f44336"
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // ABOUT SECTION
            // ═══════════════════════════════════════════════════════════
            Item { Layout.preferredHeight: 40 }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: aboutCol.implicitHeight + 80
                color: Qt.rgba(Theme.primary.r || 0.13, Theme.primary.g || 0.59, Theme.primary.b || 0.95, 0.04)

                ColumnLayout {
                    id: aboutCol
                    anchors.fill: parent
                    anchors.margins: 40
                    spacing: 16

                    CText {
                        variant: "h3"
                        text: "About MetaBuilder"
                        Layout.alignment: Qt.AlignHCenter
                    }

                    CText {
                        variant: "body1"
                        text: "MetaBuilder is a universal platform for building data-driven applications through declarative configuration. " +
                              "Define your entities in JSON schemas, wire them with visual workflows, and deploy across desktop (Qt6), " +
                              "web (Next.js), and CLI — all backed by a C++ DBAL daemon that speaks to 14 database backends."
                        wrapMode: Text.Wrap
                        Layout.fillWidth: true
                        Layout.maximumWidth: 700
                        Layout.alignment: Qt.AlignHCenter
                        horizontalAlignment: Text.AlignHCenter
                        opacity: 0.7
                        lineHeight: 1.6
                    }

                    CText {
                        variant: "body2"
                        text: "95% JSON config. 5% infrastructure code. Zero boilerplate."
                        Layout.alignment: Qt.AlignHCenter
                        opacity: 0.5
                        font.italic: true
                        Layout.topMargin: 8
                    }

                    RowLayout {
                        Layout.alignment: Qt.AlignHCenter
                        Layout.topMargin: 12
                        spacing: 12

                        CButton {
                            text: "Login as Demo"
                            variant: "primary"
                            onClicked: {
                                appWindow.login("demo", "demo")
                            }
                        }
                        CButton {
                            text: "Login as God"
                            variant: "ghost"
                            onClicked: {
                                appWindow.login("god", "god123")
                            }
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════
            // QUICK CREDENTIALS (for demo)
            // ═══════════════════════════════════════════════════════════
            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 40
                Layout.rightMargin: 40
                Layout.topMargin: 32
                spacing: 12

                CText {
                    variant: "h4"
                    text: "Quick Access"
                    Layout.alignment: Qt.AlignHCenter
                }

                GridLayout {
                    Layout.fillWidth: true
                    columns: 4
                    columnSpacing: 12
                    rowSpacing: 12

                    Repeater {
                        model: [
                            { user: "demo",  pass: "demo",     role: "User",      level: 2, color: "#4CAF50" },
                            { user: "admin", pass: "admin",    role: "Admin",     level: 3, color: "#FF9800" },
                            { user: "god",   pass: "god123",   role: "God",       level: 4, color: "#9C27B0" },
                            { user: "super", pass: "super123", role: "Super God", level: 5, color: "#FF5722" }
                        ]
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 72
                            radius: 8
                            color: credMA.containsMouse ? Qt.rgba(modelData.color.r || 0, modelData.color.g || 0, modelData.color.b || 0, 0.08) : Theme.paper
                            border.color: credMA.containsMouse ? modelData.color : Theme.border
                            border.width: 1

                            Behavior on border.color { ColorAnimation { duration: 150 } }
                            Behavior on color { ColorAnimation { duration: 150 } }

                            MouseArea {
                                id: credMA
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appWindow.login(modelData.user, modelData.pass)
                            }

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 12
                                spacing: 10

                                Rectangle {
                                    width: 40
                                    height: 40
                                    radius: 20
                                    color: modelData.color

                                    CText {
                                        anchors.centerIn: parent
                                        text: modelData.level.toString()
                                        color: "#FFFFFF"
                                        font.bold: true
                                        font.pixelSize: 16
                                    }
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 2

                                    CText {
                                        variant: "subtitle1"
                                        text: modelData.role
                                        font.bold: true
                                    }
                                    CText {
                                        variant: "caption"
                                        text: modelData.user + " / " + modelData.pass
                                        opacity: 0.5
                                    }
                                }

                                CText {
                                    text: "\u2192"
                                    font.pixelSize: 18
                                    opacity: credMA.containsMouse ? 1.0 : 0.3

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
            Item { Layout.preferredHeight: 32 }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 60
                color: Theme.paper

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 40
                    anchors.rightMargin: 40

                    CText {
                        variant: "caption"
                        text: "\u00a9 2026 MetaBuilder Platform"
                        opacity: 0.5
                    }

                    Item { Layout.fillWidth: true }

                    CText {
                        variant: "caption"
                        text: "Qt6 \u2022 Next.js \u2022 C++ DBAL \u2022 JSON Workflows"
                        opacity: 0.4
                    }
                }
            }
        }
    }
}
