import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true
    Layout.preferredWidth: 1

    property string host: ""
    property string port: ""
    property string username: ""
    property string password: ""
    property int encryptionIndex: 1
    property var encryptionOptions: ["None", "TLS", "SSL"]
    property string connectionStatus: "untested"

    signal hostEdited(string value)
    signal portEdited(string value)
    signal usernameEdited(string value)
    signal passwordEdited(string value)
    signal encryptionEdited(int index)
    signal testRequested()

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        CText { variant: "h4"; text: "SMTP Server" }
        CDivider { Layout.fillWidth: true }

        CTextField {
            Layout.fillWidth: true
            label: "Host"
            placeholderText: "smtp.example.com"
            text: root.host
            onTextChanged: root.hostEdited(text)
        }

        CTextField {
            Layout.fillWidth: true
            label: "Port"
            placeholderText: "587"
            text: root.port
            onTextChanged: root.portChanged(text)
        }

        CTextField {
            Layout.fillWidth: true
            label: "Username"
            placeholderText: "user@example.com"
            text: root.username
            onTextChanged: root.usernameChanged(text)
        }

        CTextField {
            Layout.fillWidth: true
            label: "Password"
            placeholderText: "Enter password"
            echoMode: TextInput.Password
            text: root.password
            onTextChanged: root.passwordChanged(text)
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            CText { variant: "caption"; text: "Encryption" }

            RowLayout {
                Layout.fillWidth: true
                spacing: 8

                Repeater {
                    model: root.encryptionOptions
                    delegate: CButton {
                        text: modelData
                        variant: root.encryptionIndex === index ? "primary" : "ghost"
                        size: "sm"
                        onClicked: root.encryptionChanged(index)
                    }
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CButton {
                text: root.connectionStatus === "testing" ? "Testing..." : "Test Connection"
                variant: "primary"
                size: "sm"
                enabled: root.connectionStatus !== "testing"
                onClicked: root.testRequested()
            }

            CStatusBadge {
                visible: root.connectionStatus === "success" || root.connectionStatus === "failed"
                status: root.connectionStatus === "success" ? "success" : "error"
                text: root.connectionStatus === "success" ? "OK" : "Fail"
            }
        }
    }
}
