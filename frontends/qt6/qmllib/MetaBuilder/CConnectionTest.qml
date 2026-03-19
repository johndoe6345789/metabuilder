import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "../dbal"

/**
 * CConnectionTest - DBAL connection test panel with URL input,
 * test button, and status indicator.
 */
ColumnLayout {
    id: root
    spacing: 12

    property bool isDark: Theme.mode === "dark"

    // ── Internal DBAL provider ──────────────────────────────────
    DBALProvider { id: dbal }

    // ── Connection state ────────────────────────────────────────
    property string dbalUrl: dbal.baseUrl
    property string mediaServiceUrl: "http://localhost:9090"
    property string dbalConnectionStatus: dbal.connected ? "connected" : "disconnected"
    property string mediaConnectionStatus: "unknown"

    // ── Helpers ─────────────────────────────────────────────────
    function connectionStatusColor(status) {
        switch (status) {
            case "connected":    return "success"
            case "disconnected": return "error"
            case "testing":      return "warning"
            default:             return "info"
        }
    }

    function connectionStatusLabel(status) {
        switch (status) {
            case "connected":    return "Connected"
            case "disconnected": return "Disconnected"
            case "testing":      return "Testing..."
            default:             return "Unknown"
        }
    }

    function testDBALConnection() {
        dbalConnectionStatus = "testing"
        dbal.baseUrl = dbalUrl
        dbal.ping(function(success, error) {
            dbalConnectionStatus = success ? "connected" : "disconnected"
        })
    }

    function testMediaConnection() {
        mediaConnectionStatus = "testing"
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                mediaConnectionStatus = (xhr.status >= 200 && xhr.status < 300)
                    ? "connected" : "disconnected"
            }
        }
        xhr.open("GET", mediaServiceUrl + "/health")
        xhr.send()
    }

    // ── DBAL Server ─────────────────────────────────────────────
    CText { variant: "subtitle2"; text: "DBAL Server"; Layout.topMargin: 4 }

    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        CTextField {
            Layout.fillWidth: true
            label: "DBAL URL"
            placeholderText: "http://localhost:8080"
            text: root.dbalUrl
            onTextChanged: root.dbalUrl = text
        }

        ColumnLayout {
            spacing: 4
            Layout.alignment: Qt.AlignBottom

            CButton {
                text: dbalConnectionStatus === "testing" ? "Testing..." : "Test Connection"
                variant: "default"
                size: "sm"
                enabled: dbalConnectionStatus !== "testing"
                onClicked: testDBALConnection()
            }

            CStatusBadge {
                status: connectionStatusColor(dbalConnectionStatus)
                text: connectionStatusLabel(dbalConnectionStatus)
            }
        }
    }

    CDivider { Layout.fillWidth: true }

    // ── Media Service ───────────────────────────────────────────
    CText { variant: "subtitle2"; text: "Media Service" }

    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        CTextField {
            Layout.fillWidth: true
            label: "Media Service URL"
            placeholderText: "http://localhost:9090"
            text: root.mediaServiceUrl
            onTextChanged: root.mediaServiceUrl = text
        }

        ColumnLayout {
            spacing: 4
            Layout.alignment: Qt.AlignBottom

            CButton {
                text: mediaConnectionStatus === "testing" ? "Testing..." : "Test Connection"
                variant: "default"
                size: "sm"
                enabled: mediaConnectionStatus !== "testing"
                onClicked: testMediaConnection()
            }

            CStatusBadge {
                status: connectionStatusColor(mediaConnectionStatus)
                text: connectionStatusLabel(mediaConnectionStatus)
            }
        }
    }
}
