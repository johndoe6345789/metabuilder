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
    property bool isDark: Theme.mode === "dark"

    DBALProvider { id: dbal }

    readonly property color accentBlue: "#6366F1"
    readonly property color accentCyan: "#06B6D4"
    readonly property color accentViolet: "#8B5CF6"
    readonly property color accentRose: "#F43F5E"
    readonly property color surfaceContainerHigh: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)

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

        // Login card
        Rectangle {
            Layout.fillWidth: true
            implicitHeight: formCol.implicitHeight + 48
            radius: 16
            color: surfaceContainerHigh
            border.color: isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
            border.width: 1

            ColumnLayout {
                id: formCol
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 24
                spacing: 16

                CTextField {
                    id: usernameField
                    Layout.fillWidth: true
                    placeholderText: "Username"
                    enabled: !loggingIn
                }

                CTextField {
                    id: passwordField
                    Layout.fillWidth: true
                    placeholderText: "Password"
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
            }
        }

        // Quick login credentials
        CText {
            text: "Quick Access"
            font.pixelSize: 14
            font.weight: Font.DemiBold
            color: Theme.textSecondary
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
                    { user: "admin", pass: "admin",    label: "Admin",     level: 3, accent: accentCyan },
                    { user: "god",   pass: "god123",   label: "God",       level: 4, accent: accentViolet },
                    { user: "super", pass: "super123", label: "Super God", level: 5, accent: accentRose }
                ]
                delegate: Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 52
                    radius: 12
                    color: qcMA.containsMouse ? Qt.rgba(modelData.accent.r, modelData.accent.g, modelData.accent.b, 0.08) : surfaceContainerHigh
                    border.color: qcMA.containsMouse ? modelData.accent : (isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08))
                    border.width: 1

                    Behavior on color { ColorAnimation { duration: 150 } }
                    Behavior on border.color { ColorAnimation { duration: 150 } }

                    MouseArea {
                        id: qcMA
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            usernameField.text = modelData.user
                            passwordField.text = modelData.pass
                            appWindow.login(modelData.user, modelData.pass)
                        }
                    }

                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 12
                        anchors.rightMargin: 12
                        spacing: 10

                        Rectangle {
                            width: 28
                            height: 28
                            radius: 8
                            color: Qt.rgba(modelData.accent.r, modelData.accent.g, modelData.accent.b, isDark ? 0.2 : 0.15)

                            CText {
                                anchors.centerIn: parent
                                text: "L" + modelData.level
                                font.pixelSize: 11
                                font.weight: Font.Bold
                                font.family: "monospace"
                                color: modelData.accent
                            }
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 1

                            CText {
                                text: modelData.label
                                font.pixelSize: 14
                                font.weight: Font.DemiBold
                            }
                            CText {
                                text: modelData.user + " / " + modelData.pass
                                font.pixelSize: 11
                                font.family: "monospace"
                                color: Theme.textSecondary
                            }
                        }

                        CText {
                            text: "\u2192"
                            font.pixelSize: 16
                            color: Theme.textSecondary
                            opacity: qcMA.containsMouse ? 1.0 : 0.3
                            Behavior on opacity { NumberAnimation { duration: 150 } }
                        }
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

    function doLogin() {
        errorMessage = ""
        loginWithDBAL(usernameField.text, passwordField.text)
    }
}
