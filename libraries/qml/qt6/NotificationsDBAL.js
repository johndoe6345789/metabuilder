// NotificationsDBAL.js — DBAL logic + helpers for NotificationsPanel

function defaultNotifications() {
    return [
        {
            id: "NTF-001", type: "system",
            title: "Scheduled Maintenance",
            message: "Maintenance window 03/20 02:00-04:00 UTC",
            timestamp: "2026-03-18 06:00", read: false
        },
        {
            id: "NTF-002", type: "alert",
            title: "High CPU Alert",
            message: "High CPU on dbal-prod — 94% for 10m",
            timestamp: "2026-03-18 07:30", read: false
        },
        {
            id: "NTF-003", type: "info",
            title: "Export Complete",
            message: "Your export is ready for download",
            timestamp: "2026-03-18 09:00", read: true
        },
        {
            id: "NTF-004", type: "warning",
            title: "Failed Login Attempts",
            message: "3 failed logins detected for eve_sec",
            timestamp: "2026-03-18 08:15", read: false
        },
        {
            id: "NTF-005", type: "system",
            title: "Deployment Successful",
            message: "v2.1.0 deployed to production",
            timestamp: "2026-03-15 12:00", read: true
        },
        {
            id: "NTF-006", type: "info",
            title: "New Package Available",
            message: "analytics v1.2.0 available",
            timestamp: "2026-03-14 10:30", read: true
        },
        {
            id: "NTF-007", type: "alert",
            title: "Disk Space Warning",
            message: "Primary storage at 87% capacity",
            timestamp: "2026-03-13 15:45", read: false
        },
        {
            id: "NTF-008", type: "system",
            title: "Database Backup Complete",
            message: "Nightly backup — 2.4 GB archived",
            timestamp: "2026-03-13 03:00", read: true
        },
        {
            id: "NTF-009", type: "info",
            title: "Welcome to MetaBuilder",
            message: "Your account has been set up",
            timestamp: "2026-03-10 08:00", read: true
        },
        {
            id: "NTF-010", type: "warning",
            title: "Certificate Expiry",
            message: "TLS certificate expires in 14 days",
            timestamp: "2026-03-12 09:00", read: false
        }
    ]
}

function countUnread(notifications) {
    var count = 0
    for (var i = 0; i < notifications.length; i++)
        if (!notifications[i].read) count++
    return count
}

function filterNotifications(notifications, activeFilter) {
    var result = []
    for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i]
        if (activeFilter === "All")
            result.push(n)
        else if (activeFilter === "System"
                 && n.type === "system")
            result.push(n)
        else if (activeFilter === "Alerts"
                 && (n.type === "alert"
                     || n.type === "warning"))
            result.push(n)
        else if (activeFilter === "Info"
                 && n.type === "info")
            result.push(n)
    }
    return result
}

function markAllRead(notifications) {
    var updated = []
    for (var i = 0; i < notifications.length; i++) {
        var n = Object.assign({}, notifications[i])
        n.read = true
        updated.push(n)
    }
    return updated
}

function markReadById(notifications, notifId) {
    var updated = []
    for (var i = 0; i < notifications.length; i++) {
        var n = Object.assign({}, notifications[i])
        if (n.id === notifId) n.read = true
        updated.push(n)
    }
    return updated
}

function dismissNotification(notifications, notifId) {
    var updated = []
    for (var i = 0; i < notifications.length; i++)
        if (notifications[i].id !== notifId)
            updated.push(notifications[i])
    return updated
}

function loadFromDBAL(dbal, callback) {
    dbal.list("notification", { take: 50 },
        function(result, error) {
        if (error || !result) return
        var items = result.items || []
        var liveNotifs = []
        for (var i = 0; i < items.length; i++) {
            var item = items[i]
            liveNotifs.push({
                id: item.id || ("NTF-LIVE-" + i),
                type: item.type || "info",
                title: item.title
                    || item.message
                    || "Notification",
                message: item.message || "",
                timestamp: item.sent
                    || item.created || "",
                read: item.status === "Inactive"
            })
        }
        if (liveNotifs.length > 0)
            callback(liveNotifs)
    })
}
