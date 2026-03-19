import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

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

    // ── Mock data (mirrors AdminView notification records) ───────
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
        for (var i = 0; i < notifications.length; i++) {
            if (!notifications[i].read) count++
        }
        return count
    }

    function filteredNotifications() {
        var result = []
        for (var i = 0; i < notifications.length; i++) {
            var n = notifications[i]
            if (activeFilter === "All") {
                result.push(n)
            } else if (activeFilter === "System" && n.type === "system") {
                result.push(n)
            } else if (activeFilter === "Alerts" && (n.type === "alert" || n.type === "warning")) {
                result.push(n)
            } else if (activeFilter === "Info" && n.type === "info") {
                result.push(n)
            }
        }
        return result
    }

    function typeIcon(type) {
        switch (type) {
            case "system":  return "\u2699"   // gear
            case "alert":   return "\u26A0"   // warning sign
            case "warning": return "\u26A0"   // warning sign
            case "info":    return "\u2139"   // info
            default:        return "\u2709"   // envelope
        }
    }

    function typeColor(type) {
        switch (type) {
            case "system":  return "#2196f3"
            case "alert":   return "#f44336"
            case "warning": return "#ff9800"
            case "info":    return "#4caf50"
            default:        return "#9e9e9e"
        }
    }

    function markAllRead() {
        var updated = []
        for (var i = 0; i < notifications.length; i++) {
            var n = Object.assign({}, notifications[i])
            n.read = true
            updated.push(n)
        }
        notifications = updated
        unreadCount = 0
    }

    function markRead(index) {
        var updated = []
        for (var i = 0; i < notifications.length; i++) {
            var n = Object.assign({}, notifications[i])
            if (i === index) n.read = true
            updated.push(n)
        }
        notifications = updated
        unreadCount = countUnread()
    }

    function dismissNotification(notifId) {
        var updated = []
        for (var i = 0; i < notifications.length; i++) {
            if (notifications[i].id !== notifId) {
                updated.push(notifications[i])
            }
        }
        notifications = updated
        unreadCount = countUnread()
    }

    function formatTimestamp(ts) {
        // Show relative-style label for recent items
        if (ts.indexOf("2026-03-18") === 0) return "Today " + ts.substring(11)
        if (ts.indexOf("2026-03-17") === 0) return "Yesterday " + ts.substring(11)
        return ts
    }

    // ── DBAL integration ─────────────────────────────────────────
    function loadFromDBAL() {
        if (!useLiveData) return
        dbal.list("notification", { take: 50 }, function(result, error) {
            if (error || !result) return
            var items = result.items || []
            var liveNotifs = []
            for (var i = 0; i < items.length; i++) {
                var item = items[i]
                liveNotifs.push({
                    id:        item.id || ("NTF-LIVE-" + i),
                    type:      item.type || "info",
                    title:     item.title || item.message || "Notification",
                    message:   item.message || "",
                    timestamp: item.sent || item.created || "",
                    read:      item.status === "Inactive"
                })
            }
            if (liveNotifs.length > 0) {
                notifications = liveNotifs
                unreadCount = countUnread()
            }
        })
    }

    Component.onCompleted: {
        if (useLiveData) loadFromDBAL()
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadFromDBAL()
    }

    // ── UI ───────────────────────────────────────────────────────
    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 16

            // ── Header ──────────────────────────────────────────
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CText {
                            variant: "h3"
                            text: "Notifications"
                        }

                        CBadge {
                            visible: unreadCount > 0
                            text: unreadCount + " unread"
                        }

                        Item { Layout.fillWidth: true }

                        CButton {
                            text: "Mark All Read"
                            variant: "ghost"
                            size: "sm"
                            enabled: unreadCount > 0
                            onClicked: markAllRead()
                        }

                        CButton {
                            text: dbal.loading ? "Loading..." : "Refresh"
                            variant: "ghost"
                            size: "sm"
                            enabled: !dbal.loading
                            onClicked: loadFromDBAL()
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // ── Filter tabs ─────────────────────────────
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        Repeater {
                            model: filters
                            delegate: CButton {
                                text: modelData
                                variant: activeFilter === modelData ? "primary" : "ghost"
                                size: "sm"
                                onClicked: activeFilter = modelData
                            }
                        }
                    }
                }
            }

            // ── Notification list ───────────────────────────────
            CCard {
                Layout.fillWidth: true
                visible: filteredNotifications().length > 0

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 0

                    Repeater {
                        model: filteredNotifications()

                        delegate: Rectangle {
                            Layout.fillWidth: true
                            height: notifContent.implicitHeight + 24
                            color: modelData.read ? "transparent" : Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.04)
                            radius: 6

                            Rectangle {
                                id: typeStripe
                                width: 4
                                height: parent.height - 8
                                anchors.left: parent.left
                                anchors.leftMargin: 4
                                anchors.verticalCenter: parent.verticalCenter
                                radius: 2
                                color: typeColor(modelData.type)
                            }

                            RowLayout {
                                id: notifContent
                                anchors.fill: parent
                                anchors.leftMargin: 16
                                anchors.rightMargin: 12
                                anchors.topMargin: 12
                                anchors.bottomMargin: 12
                                spacing: 12

                                // Type icon circle
                                Rectangle {
                                    width: 36
                                    height: 36
                                    radius: 18
                                    color: Qt.rgba(typeColor(modelData.type).r, typeColor(modelData.type).g, typeColor(modelData.type).b, 0.15)
                                    Layout.alignment: Qt.AlignTop

                                    CText {
                                        anchors.centerIn: parent
                                        text: typeIcon(modelData.type)
                                        variant: "body1"
                                    }
                                }

                                // Content
                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 4

                                    FlexRow {
                                        Layout.fillWidth: true
                                        spacing: 8

                                        CText {
                                            variant: modelData.read ? "body1" : "subtitle1"
                                            text: modelData.title
                                            font.bold: !modelData.read
                                        }

                                        CBadge {
                                            text: modelData.type
                                            visible: true
                                        }

                                        Item { Layout.fillWidth: true }

                                        CText {
                                            variant: "caption"
                                            text: formatTimestamp(modelData.timestamp)
                                            opacity: 0.6
                                        }
                                    }

                                    CText {
                                        Layout.fillWidth: true
                                        variant: "body2"
                                        text: modelData.message
                                        opacity: modelData.read ? 0.6 : 0.85
                                        wrapMode: Text.WordWrap
                                    }
                                }

                                // Actions
                                ColumnLayout {
                                    Layout.alignment: Qt.AlignTop
                                    spacing: 4

                                    CButton {
                                        visible: !modelData.read
                                        text: "Read"
                                        variant: "ghost"
                                        size: "sm"
                                        onClicked: {
                                            // Find original index
                                            for (var i = 0; i < notifications.length; i++) {
                                                if (notifications[i].id === modelData.id) {
                                                    markRead(i)
                                                    break
                                                }
                                            }
                                        }
                                    }

                                    CButton {
                                        text: "Dismiss"
                                        variant: "ghost"
                                        size: "sm"
                                        onClicked: dismissNotification(modelData.id)
                                    }
                                }
                            }

                            // Bottom separator
                            CDivider {
                                anchors.bottom: parent.bottom
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.leftMargin: 16
                                anchors.rightMargin: 16
                            }

                            MouseArea {
                                anchors.fill: parent
                                z: -1
                                onClicked: {
                                    for (var i = 0; i < notifications.length; i++) {
                                        if (notifications[i].id === modelData.id) {
                                            markRead(i)
                                            break
                                        }
                                    }
                                }
                                cursorShape: Qt.PointingHandCursor
                            }
                        }
                    }
                }
            }

            // ── Empty state ─────────────────────────────────────
            CCard {
                Layout.fillWidth: true
                visible: filteredNotifications().length === 0

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 40
                    spacing: 16
                    Layout.alignment: Qt.AlignHCenter

                    CText {
                        Layout.alignment: Qt.AlignHCenter
                        variant: "h2"
                        text: "\u{1F514}"
                    }

                    CText {
                        Layout.alignment: Qt.AlignHCenter
                        variant: "h4"
                        text: activeFilter === "All" ? "No notifications" : "No " + activeFilter.toLowerCase() + " notifications"
                    }

                    CText {
                        Layout.alignment: Qt.AlignHCenter
                        variant: "body2"
                        text: "When there are new notifications, they will appear here."
                        opacity: 0.6
                    }
                }
            }

            // ── Summary footer ──────────────────────────────────
            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                visible: notifications.length > 0

                CText {
                    variant: "caption"
                    text: notifications.length + " total notifications"
                    opacity: 0.5
                }

                CText {
                    variant: "caption"
                    text: " \u00b7 "
                    opacity: 0.3
                }

                CText {
                    variant: "caption"
                    text: unreadCount + " unread"
                    opacity: 0.5
                }

                Item { Layout.fillWidth: true }

                CText {
                    variant: "caption"
                    text: useLiveData ? "Live data" : "Mock data"
                    opacity: 0.4
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 20 }
        }
    }
}
