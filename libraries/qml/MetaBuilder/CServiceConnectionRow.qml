import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    spacing: 12

    property string label: ""
    property string fieldLabel: ""
    property string placeholder: ""
    property string url: ""
    property string connectionStatus: "unknown"

    signal urlEdited(string newUrl)
    signal testRequested()

    function statusColor(status) {
        switch (status) {
            case "connected":    return "success"
            case "disconnected": return "error"
            case "testing":      return "warning"
            default:             return "info"
        }
    }

    function statusLabel(status) {
        switch (status) {
            case "connected":    return "Connected"
            case "disconnected": return "Disconnected"
            case "testing":      return "Testing..."
            default:             return "Unknown"
        }
    }

    CText { variant: "subtitle2"; text: root.label }

    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        CTextField {
            Layout.fillWidth: true
            label: root.fieldLabel
            placeholderText: root.placeholder
            text: root.url
            onTextChanged: root.urlEdited(text)
        }

        ColumnLayout {
            spacing: 4
            Layout.alignment: Qt.AlignBottom

            CButton {
                text: root.connectionStatus === "testing"
                    ? "Testing..." : "Test Connection"
                variant: "default"; size: "sm"
                enabled: root.connectionStatus !== "testing"
                onClicked: root.testRequested()
            }

            CStatusBadge {
                status: root.statusColor(root.connectionStatus)
                text: root.statusLabel(root.connectionStatus)
            }
        }
    }
}
