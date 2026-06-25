import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: root
    property bool isEdit: false
    property string formUsername: ""
    property string formEmail: ""
    property string formPassword: ""
    property string formRole: "user"
    property bool formActive: true
    property var roles: ["user", "admin", "god", "supergod"]
    signal accepted()
    signal cancelled()
    title: isEdit ? "Edit User" : "Create User"

    ColumnLayout {
        spacing: 14; width: 380

        CTextField {
            Layout.fillWidth: true; label: "Username"
            placeholderText: "Enter username"
            text: root.formUsername
            onTextChanged: root.formUsername = text
        }
        CTextField {
            Layout.fillWidth: true; label: "Email"
            placeholderText: "Enter email address"
            text: root.formEmail
            onTextChanged: root.formEmail = text
        }
        ColumnLayout {
            Layout.fillWidth: true; spacing: 4
            CTextField {
                Layout.fillWidth: true; label: "Password"
                placeholderText: root.isEdit
                    ? "Leave blank to keep current" : "Enter password"
                text: root.formPassword; echoMode: TextInput.Password
                onTextChanged: root.formPassword = text
            }
            CBadge { text: "SHA-512 hashed"; badgeColor: "#607d8b" }
        }
        ColumnLayout {
            Layout.fillWidth: true; spacing: 6
            CText { variant: "caption"; text: "Role" }
            FlexRow {
                Layout.fillWidth: true; spacing: 6
                Repeater {
                    model: root.roles
                    CChip {
                        text: modelData
                        selected: root.formRole === modelData
                        onClicked: root.formRole = modelData
                    }
                }
            }
        }
        FlexRow {
            Layout.fillWidth: true; spacing: 8
            CText { variant: "body2"; text: "Active" }
            CSwitch {
                checked: root.formActive
                onCheckedChanged: root.formActive = checked
            }
        }
        CDivider { Layout.fillWidth: true }
        FlexRow {
            Layout.fillWidth: true; spacing: 8
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"; variant: "ghost"
                onClicked: root.cancelled()
            }
            CButton {
                text: root.isEdit ? "Save Changes" : "Create"
                variant: "primary"
                enabled: root.isEdit
                    ? root.formUsername !== "" && root.formEmail !== ""
                    : root.formUsername !== "" &&
                        root.formEmail !== "" && root.formPassword !== ""
                onClicked: root.accepted()
            }
        }
    }
}
