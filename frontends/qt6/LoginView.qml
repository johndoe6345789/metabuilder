import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: loginView
    color: "transparent"

    property string errorMessage: ""

    ColumnLayout {
        anchors.centerIn: parent
        width: 400
        spacing: 20

        CCard {
            Layout.fillWidth: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 32
                spacing: 16

                CText {
                    variant: "h3"
                    text: "Sign in to MetaBuilder"
                    Layout.alignment: Qt.AlignHCenter
                }

                CText {
                    variant: "body2"
                    text: "Enter your credentials to access higher levels"
                    Layout.alignment: Qt.AlignHCenter
                }

                CTextField {
                    id: usernameField
                    Layout.fillWidth: true
                    label: "Username"
                    placeholderText: "demo, admin, god, or super"
                }

                CTextField {
                    id: passwordField
                    Layout.fillWidth: true
                    label: "Password"
                    placeholderText: "Enter password"
                    echoMode: TextInput.Password
                    onAccepted: doLogin()
                }

                CText {
                    visible: errorMessage.length > 0
                    text: errorMessage
                    colorVariant: "error"
                    variant: "body2"
                }

                CButton {
                    Layout.fillWidth: true
                    text: "Sign In"
                    variant: "primary"
                    onClicked: doLogin()
                }

                CDivider { Layout.fillWidth: true }

                CText {
                    variant: "caption"
                    text: "Default accounts: demo/demo (L2) \u00b7 admin/admin (L3) \u00b7 god/god123 (L4) \u00b7 super/super123 (L5)"
                    wrapMode: Text.Wrap
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                }
            }
        }
    }

    function doLogin() {
        if (appWindow.login(usernameField.text, passwordField.text)) {
            errorMessage = ""
        } else {
            errorMessage = "Invalid username or password"
        }
    }
}
