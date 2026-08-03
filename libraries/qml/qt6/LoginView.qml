import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: loginView; color: "transparent"
    objectName: "view_login"
    Accessible.role: Accessible.Pane
    Accessible.name: "Login"
    property string errorMessage: ""
    property bool loggingIn: false
    property bool isDark:
        Theme.mode === "dark"
    DBALProvider { id: dbal }

    // Real sign-in isn't wired up yet -- this used to fall back to
    // hardcoded dev credentials, which was a security hole, not a
    // convenience. See LoginDBAL.js for why.
    function loginWithDBAL(username, password) {
        errorMessage = "Sign-in isn't available yet"
            + " -- SSO support is coming in a follow-up."
    }

    ColumnLayout {
        anchors.centerIn: parent
        width: 420; spacing: 24
        CText {
            text: "Sign in to MetaBuilder"
            font.pixelSize: 26
            font.weight: Font.Bold
            Layout.fillWidth: true
            horizontalAlignment:
                Text.AlignHCenter
        }
        CText {
            text: "Enter your credentials"
                + " to access higher levels"
            font.pixelSize: 14
            color: Theme.textSecondary
            Layout.fillWidth: true
            horizontalAlignment:
                Text.AlignHCenter
        }
        CLoginForm {
            id: loginForm
            Layout.fillWidth: true
            isDark: loginView.isDark
            loading: loginView.loggingIn
            errorMessage:
                loginView.errorMessage
            onLogin:
                function(username, password) {
                loginView.errorMessage = ""
                loginWithDBAL(
                    username, password)
            }
        }
        CButton {
            text: "\u2190 Back to home"
            variant: "text"; size: "sm"
            Layout.alignment: Qt.AlignHCenter
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Back to home"
            Keys.onReturnPressed:
                appWindow.currentView =
                    "frontpage"
            Keys.onSpacePressed:
                appWindow.currentView =
                    "frontpage"
            onClicked:
                appWindow.currentView =
                    "frontpage"
        }
    }
}
