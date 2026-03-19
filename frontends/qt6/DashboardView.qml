import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: dashRoot
    color: "transparent"

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    property var healthData: ({})
    property bool dbalOnline: dbal.connected

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
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 20

            // Welcome header
            CCard {
                Layout.fillWidth: true
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 24
                    spacing: 12

                    CText {
                        variant: "h3"
                        text: "Welcome back, " + appWindow.currentUser
                    }
                    CText {
                        variant: "body1"
                        text: "Level " + appWindow.currentLevel + " \u00b7 " + appWindow.currentRole + " access"
                    }

                    CButton {
                        text: dbal.loading ? "Refreshing..." : "Refresh"
                        variant: "ghost"
                        size: "sm"
                        enabled: !dbal.loading
                        onClicked: refreshDBAL()
                    }
                }
            }

            // Stats row
            FlexRow {
                Layout.fillWidth: true
                spacing: 16

                Repeater {
                    model: [
                        { title: "DBAL Status",  value: dbalOnline ? "Healthy" : "Offline",  status: dbalOnline ? "success" : "error" },
                        { title: "Packages",     value: "20",       status: "info" },
                        { title: "Active Users", value: "4",        status: "info" },
                        { title: "Uptime",       value: "99.9%",    status: "success" }
                    ]
                    delegate: CCard {
                        Layout.fillWidth: true
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 8
                            CText { variant: "caption"; text: modelData.title }
                            CText { variant: "h3"; text: modelData.value }
                            CStatusBadge { status: modelData.status; text: modelData.status === "success" ? "Online" : "Active" }
                        }
                    }
                }
            }

            // Recent activity
            CCard {
                Layout.fillWidth: true
                title: "Recent Activity"

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 8

                    CText { variant: "h4"; text: "Recent Activity" }
                    CDivider { Layout.fillWidth: true }

                    Repeater {
                        model: [
                            { action: "Package installed", detail: "material_ui v2.1.0", time: "2 min ago" },
                            { action: "User logged in",   detail: "admin",              time: "5 min ago" },
                            { action: "Workflow executed", detail: "on_user_created",    time: "12 min ago" },
                            { action: "Schema updated",   detail: "forum entity",       time: "1 hr ago" },
                            { action: "Seed data loaded", detail: "5 namespaces",       time: "2 hr ago" }
                        ]
                        delegate: CListItem {
                            Layout.fillWidth: true
                            title: modelData.action
                            subtitle: modelData.detail + " \u00b7 " + modelData.time
                        }
                    }
                }
            }

            // Quick actions
            CCard {
                Layout.fillWidth: true
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12
                    CText { variant: "h4"; text: "Quick Actions" }
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 10
                        CButton { text: "Forum";     variant: "default"; onClicked: appWindow.currentView = "forum" }
                        CButton { text: "Gallery";    variant: "default"; onClicked: appWindow.currentView = "gallery" }
                        CButton { text: "Guestbook";  variant: "default"; onClicked: appWindow.currentView = "guestbook" }
                        CButton { text: "Blog";       variant: "default"; onClicked: appWindow.currentView = "blog" }
                        CButton { text: "Profile";    variant: "ghost";   onClicked: appWindow.currentView = "profile" }
                    }
                }
            }
        }
    }
}
