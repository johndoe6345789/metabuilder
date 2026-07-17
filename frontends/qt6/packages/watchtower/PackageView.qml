import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    property bool autoRefresh: true
    property int refreshInterval: 5
    property int lastRefreshAgo: 0

    property var services: [
        { name: "DBAL",     status: "healthy",  uptime: "14d 6h 32m",  responseMs: 12,  lastCheck: "08:14:00", icon: "DB" },
        { name: "Media",    status: "healthy",  uptime: "14d 6h 30m",  responseMs: 45,  lastCheck: "08:14:02", icon: "MD" },
        { name: "Redis",    status: "healthy",  uptime: "14d 6h 28m",  responseMs: 3,   lastCheck: "08:14:01", icon: "RD" },
        { name: "Postgres", status: "degraded", uptime: "7d 12h 15m",  responseMs: 128, lastCheck: "08:13:58", icon: "PG" },
        { name: "Nginx",    status: "healthy",  uptime: "14d 6h 32m",  responseMs: 8,   lastCheck: "08:14:03", icon: "NX" }
    ]

    property var metrics: ({
        cpu: 34,
        memory: 67,
        disk: 52
    })

    ListModel {
        id: alertLog

        ListElement { severity: "warning"; message: "Postgres response time elevated (128ms)"; timestamp: "08:13:58" }
        ListElement { severity: "info"; message: "Redis cache hit rate: 94.2%"; timestamp: "08:12:30" }
        ListElement { severity: "error"; message: "Media service timeout on /api/v1/transcode (recovered)"; timestamp: "08:10:15" }
        ListElement { severity: "warning"; message: "Disk usage crossed 50% threshold"; timestamp: "08:05:00" }
        ListElement { severity: "info"; message: "DBAL auto-seed completed successfully"; timestamp: "07:45:22" }
        ListElement { severity: "info"; message: "System startup complete — all services initialized"; timestamp: "07:40:00" }
        ListElement { severity: "error"; message: "Failed health check on Postgres (timeout), auto-retried OK"; timestamp: "07:38:45" }
        ListElement { severity: "warning"; message: "Memory usage spike to 78% during backup (normalized)"; timestamp: "06:30:10" }
    }

    Timer {
        id: refreshTimer
        interval: root.refreshInterval * 1000
        running: root.autoRefresh
        repeat: true
        onTriggered: {
            root.lastRefreshAgo = 0
            // Simulate small metric fluctuations
            var m = Object.assign({}, root.metrics)
            m.cpu = Math.max(5, Math.min(95, m.cpu + Math.floor(Math.random() * 11) - 5))
            m.memory = Math.max(20, Math.min(95, m.memory + Math.floor(Math.random() * 7) - 3))
            root.metrics = m
        }
    }

    Timer {
        interval: 1000
        running: true
        repeat: true
        onTriggered: root.lastRefreshAgo++
    }

    function statusColor(s) {
        if (s === "healthy") return "#2ecc71"
        if (s === "degraded") return "#f39c12"
        return "#e74c3c"
    }

    function statusLabel(s) {
        if (s === "healthy") return "success"
        if (s === "degraded") return "warning"
        return "error"
    }

    function severityColor(s) {
        if (s === "error") return "#e74c3c"
        if (s === "warning") return "#f39c12"
        return "#3498db"
    }

    function metricColor(pct) {
        if (pct >= 80) return "#e74c3c"
        if (pct >= 60) return "#f39c12"
        return "#2ecc71"
    }

    function healthyCount() {
        var c = 0
        for (var i = 0; i < services.length; i++)
            if (services[i].status === "healthy") c++
        return c
    }

    function manualRefresh() {
        root.lastRefreshAgo = 0
        var m = Object.assign({}, root.metrics)
        m.cpu = Math.max(5, Math.min(95, m.cpu + Math.floor(Math.random() * 11) - 5))
        m.memory = Math.max(20, Math.min(95, m.memory + Math.floor(Math.random() * 7) - 3))
        root.metrics = m
    }

    ScrollView {
        Layout.fillWidth: true
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 16

            // ── Header ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CText { variant: "h2"; text: "Watchtower" }
                        CStatusBadge {
                            status: healthyCount() === services.length ? "success" : "warning"
                            text: healthyCount() + "/" + services.length + " Healthy"
                        }

                        Item { Layout.fillWidth: true }

                        CText {
                            variant: "caption"
                            text: "Updated " + root.lastRefreshAgo + "s ago"
                            opacity: 0.6
                        }

                        CButton {
                            text: "Refresh"
                            variant: "ghost"
                            size: "sm"
                            onClicked: root.manualRefresh()
                        }

                        // Auto-refresh toggle
                        FlexRow {
                            spacing: 6
                            CText { variant: "caption"; text: "Auto" }
                            Switch {
                                checked: root.autoRefresh
                                onCheckedChanged: root.autoRefresh = checked
                            }
                        }
                    }
                }
            }

            // ── Service Health Grid ──
            CText { variant: "h3"; text: "Service Health" }

            GridLayout {
                Layout.fillWidth: true
                columns: 3
                columnSpacing: 12
                rowSpacing: 12

                Repeater {
                    model: root.services

                    CCard {
                        Layout.fillWidth: true
                        Layout.preferredWidth: 200

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 8

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 10

                                CAvatar {
                                    initials: modelData.icon
                                    bgColor: statusColor(modelData.status)
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 2
                                    CText { variant: "subtitle1"; text: modelData.name }
                                    CStatusBadge { status: statusLabel(modelData.status); text: modelData.status }
                                }
                            }

                            CDivider { Layout.fillWidth: true }

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 4
                                CText { variant: "caption"; text: "Uptime:" }
                                CText { variant: "caption"; text: modelData.uptime; font.bold: true }
                            }

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 4
                                CText { variant: "caption"; text: "Response:" }
                                CText {
                                    variant: "caption"
                                    text: modelData.responseMs + "ms"
                                    font.bold: true
                                    color: modelData.responseMs > 100 ? "#f39c12" : "#2ecc71"
                                }
                            }

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 4
                                CText { variant: "caption"; text: "Last check:" }
                                CText { variant: "caption"; text: modelData.lastCheck; opacity: 0.6 }
                            }
                        }
                    }
                }
            }

            // ── System Metrics ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 16

                    CText { variant: "h3"; text: "System Metrics" }

                    // CPU
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4

                        FlexRow {
                            Layout.fillWidth: true
                            CText { variant: "body2"; text: "CPU Usage" }
                            Item { Layout.fillWidth: true }
                            CText { variant: "body2"; text: root.metrics.cpu + "%"; font.bold: true; color: metricColor(root.metrics.cpu) }
                        }
                        Rectangle {
                            Layout.fillWidth: true
                            height: 10
                            radius: 5
                            color: Theme.border
                            Rectangle {
                                width: parent.width * root.metrics.cpu / 100
                                height: parent.height
                                radius: 5
                                color: metricColor(root.metrics.cpu)
                                Behavior on width { NumberAnimation { duration: 300 } }
                            }
                        }
                    }

                    // Memory
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4

                        FlexRow {
                            Layout.fillWidth: true
                            CText { variant: "body2"; text: "Memory Usage" }
                            Item { Layout.fillWidth: true }
                            CText { variant: "body2"; text: root.metrics.memory + "%"; font.bold: true; color: metricColor(root.metrics.memory) }
                        }
                        Rectangle {
                            Layout.fillWidth: true
                            height: 10
                            radius: 5
                            color: Theme.border
                            Rectangle {
                                width: parent.width * root.metrics.memory / 100
                                height: parent.height
                                radius: 5
                                color: metricColor(root.metrics.memory)
                                Behavior on width { NumberAnimation { duration: 300 } }
                            }
                        }
                    }

                    // Disk
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4

                        FlexRow {
                            Layout.fillWidth: true
                            CText { variant: "body2"; text: "Disk Usage" }
                            Item { Layout.fillWidth: true }
                            CText { variant: "body2"; text: root.metrics.disk + "%"; font.bold: true; color: metricColor(root.metrics.disk) }
                        }
                        Rectangle {
                            Layout.fillWidth: true
                            height: 10
                            radius: 5
                            color: Theme.border
                            Rectangle {
                                width: parent.width * root.metrics.disk / 100
                                height: parent.height
                                radius: 5
                                color: metricColor(root.metrics.disk)
                                Behavior on width { NumberAnimation { duration: 300 } }
                            }
                        }
                    }
                }
            }

            // ── Alert Log ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        CText { variant: "h3"; text: "Alert Log" }
                        CBadge { text: alertLog.count + " entries" }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Clear Log"
                            variant: "ghost"
                            size: "sm"
                            onClicked: alertLog.clear()
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    Repeater {
                        model: alertLog

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 10

                            // Severity dot
                            Rectangle {
                                width: 10
                                height: 10
                                radius: 5
                                color: severityColor(model.severity)
                                Layout.alignment: Qt.AlignVCenter
                            }

                            CText {
                                variant: "caption"
                                text: model.timestamp
                                Layout.preferredWidth: 70
                                opacity: 0.6
                            }

                            CBadge {
                                text: model.severity
                                accent: model.severity === "error"
                            }

                            CText {
                                variant: "body2"
                                text: model.message
                                Layout.fillWidth: true
                                wrapMode: Text.WordWrap
                            }
                        }
                    }
                }
            }
        }
    }
}
