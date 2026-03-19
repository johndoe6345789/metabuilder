import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: godPanel
    color: "transparent"

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

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // ── Header ──
        CCard {
            Layout.fillWidth: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 20
                spacing: 12

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 12

                    CText { variant: "h2"; text: "God Panel" }
                    CBadge { text: "Level 4" }
                    CStatusBadge { status: "success"; text: "Active" }

                    Item { Layout.fillWidth: true }

                    CButton {
                        text: "Level 1"
                        variant: "ghost"
                        size: "sm"
                        onClicked: appWindow.currentView = "frontpage"
                    }
                    CButton {
                        text: "Level 2"
                        variant: "ghost"
                        size: "sm"
                        onClicked: appWindow.currentView = "dashboard"
                    }
                    CButton {
                        text: "Level 3"
                        variant: "ghost"
                        size: "sm"
                        onClicked: appWindow.currentView = "admin"
                    }
                }

                CDivider { Layout.fillWidth: true }

                // Config summary chips
                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CChip { text: configCounts.schemas + " Schemas" }
                    CChip { text: configCounts.workflows + " Workflows" }
                    CChip { text: configCounts.luaScripts + " Lua Scripts" }
                    CChip { text: configCounts.packages + " Packages" }
                    CChip { text: configCounts.pages + " Pages" }
                    CChip { text: configCounts.components + " Components" }
                    CChip { text: configCounts.users + " Users" }
                    CChip { text: configCounts.dbBackends + " DB Backends" }
                }
            }
        }

        // ── Tab bar ──
        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            tabs: tabModel
        }

        // ── Tab content ──
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            // 0 - Guide (inline)
            Rectangle {
                color: "transparent"

                ScrollView {
                    anchors.fill: parent
                    clip: true

                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        CCard {
                            Layout.fillWidth: true

                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 24
                                spacing: 16

                                CText { variant: "h3"; text: "Builder Quick Reference" }
                                CText {
                                    variant: "body1"
                                    text: "MetaBuilder uses a 5-level permission and interface system. Each level unlocks progressively more powerful tools."
                                    wrapMode: Text.Wrap
                                    Layout.fillWidth: true
                                }

                                CDivider { Layout.fillWidth: true }

                                Repeater {
                                    model: [
                                        {
                                            level: "Level 1 - Public",
                                            role: "public",
                                            desc: "Landing page, public content, registration. No authentication required. Read-only access to published pages and packages."
                                        },
                                        {
                                            level: "Level 2 - User",
                                            role: "user",
                                            desc: "Authenticated user dashboard. Access to forum, gallery, guestbook, blog, profile. Personal content creation and community interaction."
                                        },
                                        {
                                            level: "Level 3 - Admin",
                                            role: "admin",
                                            desc: "Django-style entity admin panel. CRUD operations on all entities, audit logs, analytics, watchtower monitoring. User management within tenant."
                                        },
                                        {
                                            level: "Level 4 - God Builder",
                                            role: "god",
                                            desc: "Full builder cockpit (this panel). Schema editor, workflow designer, Lua scripting, page routing, component hierarchy, CSS classes, dropdown configs, database management, and system settings."
                                        },
                                        {
                                            level: "Level 5 - Super God",
                                            role: "supergod",
                                            desc: "Cross-tenant platform control. Infrastructure management, deployment orchestration, multi-tenant provisioning, global configuration, and platform-wide observability."
                                        }
                                    ]

                                    delegate: CCard {
                                        Layout.fillWidth: true
                                        variant: "outlined"

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 16
                                            spacing: 8

                                            FlexRow {
                                                spacing: 10
                                                CText { variant: "subtitle1"; text: modelData.level }
                                                CBadge { text: modelData.role }
                                            }
                                            CText {
                                                variant: "body2"
                                                text: modelData.desc
                                                wrapMode: Text.Wrap
                                                Layout.fillWidth: true
                                            }
                                        }
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                CAlert {
                                    severity: "info"
                                    text: "Philosophy: 95% JSON config, 5% TypeScript/C++ infrastructure. Entities, workflows, pages, and business logic are all declarative."
                                }
                            }
                        }
                    }
                }
            }

            // 1 - Packages
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "PackageManager.qml"
                }
            }

            // 2 - Page Routes
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "PageRoutesManager.qml"
                }
            }

            // 3 - Components
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "ComponentHierarchyEditor.qml"
                }
            }

            // 4 - Users
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "UserManagement.qml"
                }
            }

            // 5 - Schemas
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "SchemaEditor.qml"
                }
            }

            // 6 - Workflows
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "WorkflowEditor.qml"
                }
            }

            // 7 - Lua Scripts
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "LuaEditor.qml"
                }
            }

            // 8 - Snippets
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "LuaEditor.qml"
                }
            }

            // 9 - CSS Classes
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "CssClassManager.qml"
                }
            }

            // 10 - Dropdowns
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "DropdownConfigManager.qml"
                }
            }

            // 11 - Database
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "DatabaseManager.qml"
                }
            }

            // 12 - Media Service
            Rectangle {
                color: "transparent"
                Loader {
                    anchors.fill: parent
                    source: "MediaServicePanel.qml"
                }
            }

            // 13 - Settings (inline: Theme + SMTP side by side)
            Rectangle {
                color: "transparent"

                ColumnLayout {
                    anchors.fill: parent
                    spacing: 16

                    CText { variant: "h3"; text: "System Settings" }
                    CText {
                        variant: "body2"
                        text: "Theme customization and SMTP configuration for outbound email."
                        color: Theme.textSecondary
                    }

                    CDivider { Layout.fillWidth: true }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 16

                        // Theme editor
                        CCard {
                            Layout.fillWidth: true
                            Layout.fillHeight: true

                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 8

                                FlexRow {
                                    spacing: 8
                                    CText { variant: "h4"; text: "Theme Editor" }
                                    CBadge { text: "Visual" }
                                }

                                CDivider { Layout.fillWidth: true }

                                Loader {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    source: "ThemeEditor.qml"
                                }
                            }
                        }

                        // SMTP config
                        CCard {
                            Layout.fillWidth: true
                            Layout.fillHeight: true

                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 8

                                FlexRow {
                                    spacing: 8
                                    CText { variant: "h4"; text: "SMTP Configuration" }
                                    CBadge { text: "Email" }
                                }

                                CDivider { Layout.fillWidth: true }

                                Loader {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    source: "SMTPConfigEditor.qml"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
