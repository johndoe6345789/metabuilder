import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "LoginDBAL.js" as DBAL

Rectangle {
    id: loginView
    color: "transparent"

    property string errorMessage: ""
    property bool loggingIn: false
    property bool isDark: Theme.mode === "dark"

    DBALProvider { id: dbal }

    readonly property color accentBlue: "#6366F1"
    readonly property color accentCyan: "#06B6D4"
    readonly property color accentAmber: "#F59E0B"
    readonly property color accentViolet: "#8B5CF6"
    readonly property color accentRose: "#F43F5E"
    readonly property var credentials: DBAL.devCredentials({ blue: accentBlue, cyan: accentCyan, amber: accentAmber, violet: accentViolet, rose: accentRose })

    function loginWithDBAL(username, password) {
        DBAL.loginWithDBAL(dbal, username, password, {
            onStart: function() { loggingIn = true; errorMessage = "" },
            onSuccess: function(result, user) {
                appWindow.currentUser = result.username || user; appWindow.currentRole = result.role || "user"
                appWindow.currentLevel = result.level || 2; appWindow.loggedIn = true
                appWindow.authToken = result.token; dbal.authToken = result.token
                appWindow.currentView = "dashboard"; loggingIn = false
            },
            onFallback: function(user, pass, error) {
                loggingIn = false
                if (!appWindow.login(user, pass)) errorMessage = error || "Invalid username or password"
            }
        })
    }

    ColumnLayout {
        anchors.centerIn: parent; width: 420; spacing: 24

        CText { text: "Sign in to MetaBuilder"; font.pixelSize: 26; font.weight: Font.Bold; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }
        CText { text: "Enter your credentials to access higher levels"; font.pixelSize: 14; color: Theme.textSecondary; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }

        CLoginForm {
            id: loginForm; Layout.fillWidth: true; isDark: loginView.isDark; loading: loginView.loggingIn; errorMessage: loginView.errorMessage
            onLogin: function(username, password) { loginView.errorMessage = ""; loginWithDBAL(username, password) }
        }

        CText { text: "Dev Credentials"; font.pixelSize: 14; font.weight: Font.DemiBold; color: Theme.textSecondary; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }
        CText { text: "Click any card below to sign in instantly"; font.pixelSize: 12; color: Theme.textSecondary; opacity: isDark ? 0.5 : 0.6; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter }

        GridLayout {
            Layout.fillWidth: true; columns: 2; columnSpacing: 10; rowSpacing: 10
            Repeater {
                model: credentials
                delegate: CQuickLoginCard {
                    Layout.fillWidth: true; username: modelData.user; password: modelData.pass
                    label: modelData.label; level: modelData.level; accent: modelData.accent; isDark: loginView.isDark
                    onLogin: { loginForm.username = modelData.user; loginForm.password = modelData.pass; appWindow.login(modelData.user, modelData.pass) }
                }
            }
        }

        CButton { text: "\u2190 Back to home"; variant: "text"; size: "sm"; Layout.alignment: Qt.AlignHCenter; onClicked: appWindow.currentView = "frontpage" }
    }
}
