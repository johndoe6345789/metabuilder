import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: dashRoot
    color: Theme.background

    // -- DBAL connection --
    DBALProvider { id: dbal }

    property var healthData: ({})
    property bool dbalOnline: dbal.connected

    readonly property bool isDark: Theme.mode === "dark"

    function refreshDBAL() {
        dbal.ping(function(success, error) {
            if (success) {
                dbal.execute("health", {}, function(result, err) {
                    if (result) healthData = result;
                });
            }
        });
    }

    Component.onCompleted: refreshDBAL()

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 24 }

            // -- Welcome header --
            CWelcomeCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                username: appWindow.currentUser
                level: appWindow.currentLevel
                role: appWindow.currentRole
                isDark: dashRoot.isDark
                loading: dbal.loading
                onRefresh: refreshDBAL()
            }

            Item { Layout.preferredHeight: 16 }

            // -- Stats row --
            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 16

                Repeater {
                    model: [
                        { label: "DBAL Status",  value: dbalOnline ? "Healthy" : "Offline",  status: dbalOnline ? "success" : "error" },
                        { label: "Packages",     value: "20",       status: "info" },
                        { label: "Active Users", value: "4",        status: "info" },
                        { label: "Uptime",       value: "99.9%",    status: "success" }
                    ]
                    delegate: CStatCard {
                        Layout.fillWidth: true
                        label: modelData.label
                        value: modelData.value
                        status: modelData.status
                        isDark: dashRoot.isDark
                    }
                }
            }

            Item { Layout.preferredHeight: 16 }

            // -- Recent activity --
            CActivityList {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                isDark: dashRoot.isDark
                activities: [
                    { action: "Package installed", detail: "material_ui v2.1.0", time: "2 min ago" },
                    { action: "User logged in",   detail: "admin",              time: "5 min ago" },
                    { action: "Workflow executed", detail: "on_user_created",    time: "12 min ago" },
                    { action: "Schema updated",   detail: "forum entity",       time: "1 hr ago" },
                    { action: "Seed data loaded", detail: "5 namespaces",       time: "2 hr ago" }
                ]
            }

            Item { Layout.preferredHeight: 16 }

            // -- Quick actions --
            CQuickActions {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                isDark: dashRoot.isDark
                actions: [
                    { label: "Forum",     view: "forum",     variant: "default" },
                    { label: "Gallery",   view: "gallery",   variant: "default" },
                    { label: "Guestbook", view: "guestbook", variant: "default" },
                    { label: "Blog",      view: "blog",      variant: "default" },
                    { label: "Profile",   view: "profile",   variant: "ghost" }
                ]
                onActionClicked: function(view) { appWindow.currentView = view }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 24 }
        }
    }
}
