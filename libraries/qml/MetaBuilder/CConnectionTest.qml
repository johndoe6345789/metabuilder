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
    objectName: "panel_connection_test"
    Accessible.role: Accessible.Pane
    Accessible.name: "Connection Test"
    spacing: 12

    property bool isDark: Theme.mode === "dark"

    DBALProvider { id: dbal }

    property string dbalUrl: dbal.baseUrl
    property string mediaServiceUrl: "http://localhost:9090"
    property string dbalConnectionStatus: dbal.connected
        ? "connected" : "disconnected"
    property string mediaConnectionStatus: "unknown"

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

    CServiceConnectionRow {
        Layout.fillWidth: true
        label: "DBAL Server"
        fieldLabel: "DBAL URL"
        placeholder: "http://localhost:8080"
        url: root.dbalUrl
        connectionStatus: root.dbalConnectionStatus
        onUrlEdited: function(newUrl) { root.dbalUrl = newUrl }
        onTestRequested: root.testDBALConnection()
    }

    CDivider { Layout.fillWidth: true }

    CServiceConnectionRow {
        Layout.fillWidth: true
        label: "Media Service"
        fieldLabel: "Media Service URL"
        placeholder: "http://localhost:9090"
        url: root.mediaServiceUrl
        connectionStatus: root.mediaConnectionStatus
        onUrlEdited: function(newUrl) { root.mediaServiceUrl = newUrl }
        onTestRequested: root.testMediaConnection()
    }
}
