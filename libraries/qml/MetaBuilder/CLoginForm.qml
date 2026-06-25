import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "form_login"
    Accessible.role: Accessible.Form
    Accessible.name: "Login Form"
    activeFocusOnTab: true

    property bool isDark: false
    property bool loading: false
    property string errorMessage: ""

    // Expose fields so parent can set them programmatically
    property alias username: usernameField.text
    property alias password: passwordField.text

    signal login(string username, string password)

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)

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
            enabled: !root.loading
            activeFocusOnTab: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Username"
            Accessible.description: "Enter your username"
            KeyNavigation.tab: passwordField
        }

        CTextField {
            id: passwordField
            Layout.fillWidth: true
            placeholderText: "Password"
            echoMode: TextInput.Password
            enabled: !root.loading
            activeFocusOnTab: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Password"
            Accessible.description: "Enter your password"
            KeyNavigation.tab: signInBtn
            onAccepted: root.login(
                usernameField.text,
                passwordField.text)
        }

        CAlert {
            Layout.fillWidth: true
            visible: root.errorMessage.length > 0
            severity: "error"
            text: root.errorMessage
        }

        CButton {
            id: signInBtn
            Layout.fillWidth: true
            text: root.loading ? "Signing in..." : "Sign In"
            variant: "primary"
            enabled: !root.loading
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: root.loading
                ? "Signing in, please wait"
                : "Sign In"
            Keys.onReturnPressed: root.login(
                usernameField.text,
                passwordField.text)
            Keys.onSpacePressed: root.login(
                usernameField.text,
                passwordField.text)
            onClicked: root.login(
                usernameField.text,
                passwordField.text)
        }
    }
}
