import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: loginView
    color: "transparent"

    property string errorMessage: ""
    property bool loggingIn: false

    DBALProvider {
        id: dbal
    }

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
                    enabled: !loggingIn
                }

                CTextField {
                    id: passwordField
                    Layout.fillWidth: true
                    label: "Password"
                    placeholderText: "Enter password"
                    echoMode: TextInput.Password
                    enabled: !loggingIn
                    onAccepted: doLogin()
                }

                CAlert {
                    Layout.fillWidth: true
                    visible: errorMessage.length > 0
                    severity: "error"
                    text: errorMessage
                }

                CButton {
                    Layout.fillWidth: true
                    text: loggingIn ? "Signing in..." : "Sign In"
                    variant: "primary"
                    enabled: !loggingIn
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

    function loginWithDBAL(username, password) {
        loggingIn = true
        errorMessage = ""

        dbal.execute("core/auth/login", { username: username, password: password }, function(result, error) {
            if (!error && result && result.token) {
                appWindow.currentUser = result.username || username
                appWindow.currentRole = result.role || "user"
                appWindow.currentLevel = result.level || 2
                appWindow.loggedIn = true
                appWindow.authToken = result.token
                dbal.authToken = result.token
                appWindow.currentView = "dashboard"
                loggingIn = false
            } else {
                // DBAL failed — fall back to local seed user auth
                loggingIn = false
                if (appWindow.login(username, password)) {
                    errorMessage = ""
                } else {
                    errorMessage = error || "Invalid username or password"
                }
            }
        })
    }

    function doLogin() {
        errorMessage = ""
        loginWithDBAL(usernameField.text, passwordField.text)
    }
}
