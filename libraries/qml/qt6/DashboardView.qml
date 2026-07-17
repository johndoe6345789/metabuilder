import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/DashboardDBAL.js"
    as DBAL

Rectangle {
    id: dashRoot
    color: Theme.background
    objectName: "view_dashboard"
    Accessible.role: Accessible.Pane
    Accessible.name: "Dashboard"

    DBALProvider { id: dbal }

    property var healthData: ({})
    property bool dbalOnline: dbal.connected
    readonly property bool isDark:
        Theme.mode === "dark"
    property var cfg: ({})

    // Five levels definition (mirrors Next.js dashboard)
    readonly property var levelDefs: [
        { level: 1, name: "Public Website",
          desc: "Landing pages, public content",
          roleNeeded: 0 },
        { level: 2, name: "User Area",
          desc: "Profiles, comments, chat",
          roleNeeded: 1 },
        { level: 3, name: "Admin Panel",
          desc: "CRUD, user management",
          roleNeeded: 3 },
        { level: 4, name: "God Builder",
          desc: "Schemas, workflows, Lua",
          roleNeeded: 4 },
        { level: 5, name: "Super God",
          desc: "Multi-tenant control",
          roleNeeded: 5 },
    ]

    Component.onCompleted: {
        var xhr = new XMLHttpRequest()
        xhr.open("GET",
            "../../frontends/qt6/config"
            + "/dashboard-config.json")
        xhr.onreadystatechange = function() {
            if (xhr.readyState
                === XMLHttpRequest.DONE
                && xhr.status === 200)
                cfg = JSON.parse(
                    xhr.responseText)
        }
        xhr.send()
        DBAL.refreshHealth(
            dbal, function(r) { healthData = r })
    }

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 24 }

            CWelcomeCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                username: appWindow.currentUser
                level: appWindow.currentLevel
                role: appWindow.currentRole
                isDark: dashRoot.isDark
                loading: dbal.loading
                onRefresh:
                    DBAL.refreshHealth(dbal,
                        function(r) {
                            healthData = r
                        })
            }

            Item { Layout.preferredHeight: 16 }

            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 16

                Repeater {
                    model: {
                        var live = {
                            label: "DBAL Status",
                            value: dbalOnline
                                ? "Healthy"
                                : "Offline",
                            status: dbalOnline
                                ? "success"
                                : "error"
                        }
                        return [live].concat(
                            cfg.staticStats || [])
                    }
                    delegate: CStatCard {
                        Layout.fillWidth: true
                        label: modelData.label
                        value: modelData.value
                        status: modelData.status
                        isDark: dashRoot.isDark
                    }
                }
            }

            Item { Layout.preferredHeight: 28 }

            // ── Five Levels of Power ─────────────────────────────
            CText {
                Layout.leftMargin: 24
                Layout.bottomMargin: 14
                variant: "h4"
                text: "Five Levels of Power"
                color: Theme.text
            }

            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 14

                Repeater {
                    model: dashRoot.levelDefs
                    delegate: CLevelCard {
                        Layout.fillWidth: true
                        level:  modelData.level
                        name:   modelData.name
                        desc:   modelData.desc
                        locked: appWindow.currentLevel
                            < modelData.roleNeeded
                        isDark: dashRoot.isDark
                        onClicked: {
                            if (!locked)
                                appWindow.currentView
                                    = "level_" + level
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 28 }

            CActivityList {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                isDark: dashRoot.isDark
                activities:
                    cfg.activities || []
            }

            Item { Layout.preferredHeight: 16 }

            CQuickActions {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                isDark: dashRoot.isDark
                actions:
                    cfg.quickActions || []
                onActionClicked: function(view) {
                    appWindow.currentView = view
                }
            }

            Item { Layout.preferredHeight: 24 }
        }
    }
}
