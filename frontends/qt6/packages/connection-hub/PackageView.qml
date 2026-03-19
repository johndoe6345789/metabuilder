import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    property var services: [
        { name: "GitHub", icon: "GH", connected: true, health: "green", lastConnected: "2026-03-19 08:12" },
        { name: "Slack", icon: "SL", connected: true, health: "green", lastConnected: "2026-03-19 07:45" },
        { name: "SMTP", icon: "SM", connected: true, health: "yellow", lastConnected: "2026-03-18 23:00" },
        { name: "S3 Storage", icon: "S3", connected: false, health: "red", lastConnected: "2026-03-15 14:30" },
        { name: "Database", icon: "DB", connected: true, health: "green", lastConnected: "2026-03-19 08:14" }
    ]

    property bool testingAll: false

    function healthColor(h) {
        if (h === "green") return "#2ecc71"
        if (h === "yellow") return "#f39c12"
        return "#e74c3c"
    }

    function healthLabel(h) {
        if (h === "green") return "Healthy"
        if (h === "yellow") return "Degraded"
        return "Offline"
    }

    function toggleConnection(index) {
        var s = services.slice()
        s[index] = Object.assign({}, s[index])
        s[index].connected = !s[index].connected
        if (!s[index].connected) {
            s[index].health = "red"
        } else {
            s[index].health = "green"
            s[index].lastConnected = "2026-03-19 08:20"
        }
        services = s
    }

    function connectedCount() {
        var c = 0
        for (var i = 0; i < services.length; i++)
            if (services[i].connected) c++
        return c
    }

    function testAll() {
        testingAll = true
        testTimer.start()
    }

    Timer {
        id: testTimer
        interval: 1500
        onTriggered: root.testingAll = false
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 20
        clip: true

        ColumnLayout {
            width: parent.width
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

                        CText { variant: "h2"; text: "Connection Hub" }
                        CStatusBadge {
                            status: connectedCount() === services.length ? "success" : "warning"
                            text: connectedCount() + "/" + services.length + " Connected"
                        }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: root.testingAll ? "Testing..." : "Test All"
                            variant: "ghost"
                            enabled: !root.testingAll
                            onClicked: root.testAll()
                        }
                    }
                }
            }

            // ── Service list ──
            Repeater {
                model: root.services

                CCard {
                    Layout.fillWidth: true

                    RowLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 16

                        // Health indicator dot
                        Rectangle {
                            width: 14
                            height: 14
                            radius: 7
                            color: healthColor(modelData.health)

                            SequentialAnimation on opacity {
                                running: root.testingAll
                                loops: Animation.Infinite
                                NumberAnimation { to: 0.3; duration: 400 }
                                NumberAnimation { to: 1.0; duration: 400 }
                            }
                        }

                        // Service icon
                        CAvatar {
                            initials: modelData.icon
                            bgColor: modelData.connected ? Theme.primary : Theme.border
                        }

                        // Service info
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 4

                            FlexRow {
                                spacing: 8
                                CText { variant: "subtitle1"; text: modelData.name }
                                CStatusBadge {
                                    status: modelData.connected ? "success" : "error"
                                    text: modelData.connected ? "Connected" : "Disconnected"
                                }
                            }

                            FlexRow {
                                spacing: 12
                                CText {
                                    variant: "caption"
                                    text: "Health: " + healthLabel(modelData.health)
                                    color: healthColor(modelData.health)
                                }
                                CText {
                                    variant: "caption"
                                    text: "Last: " + modelData.lastConnected
                                    opacity: 0.6
                                }
                            }
                        }

                        // Connect / Disconnect toggle
                        CButton {
                            text: modelData.connected ? "Disconnect" : "Connect"
                            variant: modelData.connected ? "ghost" : "default"
                            size: "sm"
                            onClicked: root.toggleConnection(index)
                        }
                    }
                }
            }

            // ── Summary footer ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 8

                    CText { variant: "subtitle1"; text: "Connection Summary" }
                    CDivider { Layout.fillWidth: true }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 16

                        ColumnLayout {
                            spacing: 4
                            CText { variant: "caption"; text: "Total Services" }
                            CText { variant: "h3"; text: services.length.toString() }
                        }
                        ColumnLayout {
                            spacing: 4
                            CText { variant: "caption"; text: "Connected" }
                            CText { variant: "h3"; text: connectedCount().toString(); color: "#2ecc71" }
                        }
                        ColumnLayout {
                            spacing: 4
                            CText { variant: "caption"; text: "Disconnected" }
                            CText { variant: "h3"; text: (services.length - connectedCount()).toString(); color: "#e74c3c" }
                        }
                    }
                }
            }
        }
    }
}
