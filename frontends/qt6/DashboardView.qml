import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: dashRoot
    color: Theme.background

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    property var healthData: ({})
    property bool dbalOnline: dbal.connected

    // ── MD3 palette ──────────────────────────────────────────────
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color surfaceContainerHigh: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

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

            // ── Welcome header ───────────────────────────────────
            Rectangle {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                implicitHeight: welcomeRow.implicitHeight + 40
                radius: 16
                color: surfaceContainerHigh
                border.color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.08)
                border.width: 1

                RowLayout {
                    id: welcomeRow
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    // User avatar
                    Rectangle {
                        width: 56
                        height: 56
                        radius: 28
                        color: Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.2 : 0.15)

                        CText {
                            anchors.centerIn: parent
                            text: appWindow.currentUser ? appWindow.currentUser.charAt(0).toUpperCase() : "?"
                            font.pixelSize: 24
                            font.weight: Font.Bold
                            color: "#6366F1"
                        }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4

                        CText {
                            text: "Welcome back, " + appWindow.currentUser
                            font.pixelSize: 22
                            font.weight: Font.Bold
                            color: onSurface
                        }
                        CText {
                            text: "Level " + appWindow.currentLevel + " \u00b7 " + appWindow.currentRole
                            font.pixelSize: 13
                            color: onSurfaceVariant
                        }
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

            Item { Layout.preferredHeight: 16 }

            // ── Stats row ────────────────────────────────────────
            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
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
                        variant: "outlined"

                        CText {
                            Layout.fillWidth: true
                            variant: "caption"
                            text: modelData.title
                            color: onSurfaceVariant
                        }

                        Item { Layout.preferredHeight: 4 }

                        CText {
                            Layout.fillWidth: true
                            variant: "h3"
                            text: modelData.value
                        }

                        Item { Layout.preferredHeight: 8 }

                        CStatusBadge {
                            status: modelData.status
                            text: modelData.status === "success" ? "Online" : "Active"
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 16 }

            // ── Recent activity ──────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "Recent Activity"
                }

                Item { Layout.preferredHeight: 8 }

                CDivider { Layout.fillWidth: true }

                Item { Layout.preferredHeight: 8 }

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

            Item { Layout.preferredHeight: 16 }

            // ── Quick actions ────────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "Quick Actions"
                }

                Item { Layout.preferredHeight: 12 }

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 10
                    CButton { text: "Forum";     variant: "default"; onClicked: appWindow.currentView = "forum" }
                    CButton { text: "Gallery";   variant: "default"; onClicked: appWindow.currentView = "gallery" }
                    CButton { text: "Guestbook"; variant: "default"; onClicked: appWindow.currentView = "guestbook" }
                    CButton { text: "Blog";      variant: "default"; onClicked: appWindow.currentView = "blog" }
                    CButton { text: "Profile";   variant: "ghost";   onClicked: appWindow.currentView = "profile" }
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 24 }
        }
    }
}
