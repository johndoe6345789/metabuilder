import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: loginView
    color: "transparent"

    property string errorMessage: ""
    property bool loggingIn: false
    property bool isDark: Theme.mode === "dark"

    DBALProvider { id: dbal }

    readonly property color accentBlue:   "#6366F1"
    readonly property color accentCyan:   "#06B6D4"
    readonly property color accentAmber:  "#F59E0B"
    readonly property color accentViolet: "#8B5CF6"
    readonly property color accentRose:   "#F43F5E"

    ColumnLayout {
        anchors.centerIn: parent
        width: 420
        spacing: 24

        // Title
        CText {
            text: "Sign in to MetaBuilder"
            font.pixelSize: 26
            font.weight: Font.Bold
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        CText {
            text: "Enter your credentials to access higher levels"
            font.pixelSize: 14
            color: Theme.textSecondary
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        // Login form
        CLoginForm {
            id: loginForm
            Layout.fillWidth: true
            isDark: loginView.isDark
            loading: loginView.loggingIn
            errorMessage: loginView.errorMessage
            onLogin: function(username, password) {
                loginView.errorMessage = ""
                loginWithDBAL(username, password)
            }
        }

        // Quick login credentials
        CText {
            text: "Dev Credentials"
            font.pixelSize: 14
            font.weight: Font.DemiBold
            color: Theme.textSecondary
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }
        CText {
            text: "Click any card below to sign in instantly"
            font.pixelSize: 12
            color: Theme.textSecondary
            opacity: isDark ? 0.5 : 0.6
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        GridLayout {
            Layout.fillWidth: true
            columns: 2
            columnSpacing: 10
            rowSpacing: 10

            Repeater {
                model: [
                    { user: "demo",  pass: "demo",     label: "User",      level: 2, accent: accentBlue },
                    { user: "mod",   pass: "mod",      label: "Moderator", level: 3, accent: accentCyan },
                    { user: "admin", pass: "admin",    label: "Admin",     level: 4, accent: accentAmber },
                    { user: "god",   pass: "god123",   label: "God",       level: 5, accent: accentViolet },
                    { user: "super", pass: "super123", label: "Super God", level: 6, accent: accentRose }
                ]
                delegate: CQuickLoginCard {
                    Layout.fillWidth: true
                    username: modelData.user
                    password: modelData.pass
                    label: modelData.label
                    level: modelData.level
                    accent: modelData.accent
                    isDark: loginView.isDark
                    onLogin: {
                        loginForm.username = modelData.user
                        loginForm.password = modelData.pass
                        appWindow.login(modelData.user, modelData.pass)
                    }
                }
            }
        }

        CButton {
            text: "\u2190 Back to home"
            variant: "text"
            size: "sm"
            Layout.alignment: Qt.AlignHCenter
            onClicked: appWindow.currentView = "frontpage"
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
                loggingIn = false
                if (appWindow.login(username, password)) {
                    errorMessage = ""
                } else {
                    errorMessage = error || "Invalid username or password"
                }
            }
        })
    }
}
