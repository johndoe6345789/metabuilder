import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: "transparent"

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    // ── State ────────────────────────────────────────────────────
    property string activeFilter: "All"
    property int unreadCount: countUnread()
    property var filters: ["All", "System", "Alerts", "Info"]

    property var notifications: [
        { id: "NTF-001", type: "system",  title: "Scheduled Maintenance",      message: "Maintenance window 03/20 from 02:00-04:00 UTC",  timestamp: "2026-03-18 06:00", read: false },
        { id: "NTF-002", type: "alert",   title: "High CPU Alert",             message: "High CPU on dbal-prod — 94% sustained for 10m",  timestamp: "2026-03-18 07:30", read: false },
        { id: "NTF-003", type: "info",    title: "Export Complete",             message: "Your export is ready for download",               timestamp: "2026-03-18 09:00", read: true  },
        { id: "NTF-004", type: "warning", title: "Failed Login Attempts",      message: "3 failed login attempts detected for eve_sec",    timestamp: "2026-03-18 08:15", read: false },
        { id: "NTF-005", type: "system",  title: "Deployment Successful",      message: "v2.1.0 deployed to production successfully",      timestamp: "2026-03-15 12:00", read: true  },
        { id: "NTF-006", type: "info",    title: "New Package Available",       message: "analytics v1.2.0 is available for installation",  timestamp: "2026-03-14 10:30", read: true  },
        { id: "NTF-007", type: "alert",   title: "Disk Space Warning",         message: "Primary storage at 87% capacity",                 timestamp: "2026-03-13 15:45", read: false },
        { id: "NTF-008", type: "system",  title: "Database Backup Complete",   message: "Nightly backup completed — 2.4 GB archived",      timestamp: "2026-03-13 03:00", read: true  },
        { id: "NTF-009", type: "info",    title: "Welcome to MetaBuilder",     message: "Your account has been set up successfully",        timestamp: "2026-03-10 08:00", read: true  },
        { id: "NTF-010", type: "warning", title: "Certificate Expiry",         message: "TLS certificate expires in 14 days",              timestamp: "2026-03-12 09:00", read: false }
    ]

    // ── Helpers ──────────────────────────────────────────────────
    function countUnread() {
        var count = 0
        for (var i = 0; i < notifications.length; i++) if (!notifications[i].read) count++
        return count
    }

    function filteredNotifications() {
        var result = []
        for (var i = 0; i < notifications.length; i++) {
            var n = notifications[i]
            if (activeFilter === "All") result.push(n)
            else if (activeFilter === "System" && n.type === "system") result.push(n)
            else if (activeFilter === "Alerts" && (n.type === "alert" || n.type === "warning")) result.push(n)
            else if (activeFilter === "Info" && n.type === "info") result.push(n)
        }
        return result
    }

    function markAllRead() {
        var updated = []
        for (var i = 0; i < notifications.length; i++) { var n = Object.assign({}, notifications[i]); n.read = true; updated.push(n) }
        notifications = updated; unreadCount = 0
    }

    function markReadById(notifId) {
        var updated = []
        for (var i = 0; i < notifications.length; i++) {
            var n = Object.assign({}, notifications[i])
            if (n.id === notifId) n.read = true
            updated.push(n)
        }
        notifications = updated; unreadCount = countUnread()
    }

    function dismissNotification(notifId) {
        var updated = []
        for (var i = 0; i < notifications.length; i++) if (notifications[i].id !== notifId) updated.push(notifications[i])
        notifications = updated; unreadCount = countUnread()
    }

    // ── DBAL integration ─────────────────────────────────────────
    function loadFromDBAL() {
        if (!useLiveData) return
        dbal.list("notification", { take: 50 }, function(result, error) {
            if (error || !result) return
            var items = result.items || []; var liveNotifs = []
            for (var i = 0; i < items.length; i++) {
                var item = items[i]
                liveNotifs.push({ id: item.id || ("NTF-LIVE-" + i), type: item.type || "info", title: item.title || item.message || "Notification",
                                  message: item.message || "", timestamp: item.sent || item.created || "", read: item.status === "Inactive" })
            }
            if (liveNotifs.length > 0) { notifications = liveNotifs; unreadCount = countUnread() }
        })
    }

    Component.onCompleted: { if (useLiveData) loadFromDBAL() }
    onUseLiveDataChanged: { if (useLiveData) loadFromDBAL() }

    // ── UI ───────────────────────────────────────────────────────
    ScrollView {
        anchors.fill: parent; anchors.margins: 24; clip: true

        ColumnLayout {
            width: parent.width; spacing: 16

            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 20; spacing: 12

                    FlexRow {
                        Layout.fillWidth: true; spacing: 12
                        CText { variant: "h3"; text: "Notifications" }
                        CBadge { visible: unreadCount > 0; text: unreadCount + " unread" }
                        Item { Layout.fillWidth: true }
                        CButton { text: "Mark All Read"; variant: "ghost"; size: "sm"; enabled: unreadCount > 0; onClicked: markAllRead() }
                        CButton { text: dbal.loading ? "Loading..." : "Refresh"; variant: "ghost"; size: "sm"; enabled: !dbal.loading; onClicked: loadFromDBAL() }
                    }

                    CDivider { Layout.fillWidth: true }

                    FlexRow {
                        Layout.fillWidth: true; spacing: 8
                        Repeater {
                            model: filters
                            delegate: CButton { text: modelData; variant: activeFilter === modelData ? "primary" : "ghost"; size: "sm"; onClicked: activeFilter = modelData }
                        }
                    }
                }
            }

            CCard {
                Layout.fillWidth: true
                visible: filteredNotifications().length > 0

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 0

                    Repeater {
                        model: filteredNotifications()

                        delegate: CNotificationItem {
                            notification: modelData
                            onMarkRead: markReadById(modelData.id)
                            onDismiss: dismissNotification(modelData.id)
                        }
                    }
                }
            }

            CNotificationEmptyState {
                visible: filteredNotifications().length === 0
                filterLabel: activeFilter
            }

            FlexRow {
                Layout.fillWidth: true; spacing: 8; visible: notifications.length > 0
                CText { variant: "caption"; text: notifications.length + " total notifications"; opacity: 0.5 }
                CText { variant: "caption"; text: " \u00b7 "; opacity: 0.3 }
                CText { variant: "caption"; text: unreadCount + " unread"; opacity: 0.5 }
                Item { Layout.fillWidth: true }
                CText { variant: "caption"; text: useLiveData ? "Live data" : "Mock data"; opacity: 0.4 }
            }

            Item { Layout.preferredHeight: 20 }
        }
    }
}
