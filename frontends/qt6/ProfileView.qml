import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: "transparent"

    property string userBio: "MetaBuilder enthusiast and open-source contributor."
    property string userEmail: "demo@metabuilder.io"
    property string userDisplayName: appWindow.currentUser
    property string currentPassword: ""
    property string newPassword: ""
    property string confirmPassword: ""

    function userInitials() {
        var name = appWindow.currentUser
        if (!name || name.length === 0) return "??"
        var parts = name.split(" ")
        if (parts.length >= 2)
            return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.substring(0, 2).toUpperCase()
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 20

            // Profile card
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 24
                    spacing: 16

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 16

                        CAvatar {
                            initials: userInitials()
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 6

                            CText {
                                variant: "h3"
                                text: appWindow.currentUser
                            }
                            CText {
                                variant: "body2"
                                text: userEmail
                                color: Theme.text
                                opacity: 0.7
                            }

                            FlexRow {
                                spacing: 8
                                CBadge { text: appWindow.currentRole }
                                CBadge { text: "Level 2" }
                            }

                            CText {
                                variant: "caption"
                                text: "Member since January 15, 2026"
                            }
                        }
                    }
                }
            }

            // Activity summary
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    CText { variant: "h4"; text: "Activity Summary" }
                    CDivider { Layout.fillWidth: true }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 16

                        Repeater {
                            model: [
                                { label: "Posts",      value: "42" },
                                { label: "Comments",   value: "128" },
                                { label: "Last Login", value: "Today, 09:15" }
                            ]
                            delegate: CCard {
                                Layout.fillWidth: true
                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 16
                                    spacing: 6
                                    CText { variant: "caption"; text: modelData.label }
                                    CText { variant: "h4"; text: modelData.value }
                                }
                            }
                        }
                    }
                }
            }

            // Edit profile section
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 14

                    CText { variant: "h4"; text: "Edit Profile" }
                    CDivider { Layout.fillWidth: true }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Display Name"
                        placeholderText: "Enter display name"
                        text: userDisplayName
                        onTextChanged: userDisplayName = text
                    }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Email"
                        placeholderText: "Enter email address"
                        text: userEmail
                        onTextChanged: userEmail = text
                    }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Bio"
                        placeholderText: "Tell us about yourself..."
                        text: userBio
                        onTextChanged: userBio = text
                    }
                }
            }

            // Change password section
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 14

                    CText { variant: "h4"; text: "Change Password" }
                    CDivider { Layout.fillWidth: true }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Current Password"
                        placeholderText: "Enter current password"
                        echoMode: TextInput.Password
                        text: currentPassword
                        onTextChanged: currentPassword = text
                    }

                    CTextField {
                        Layout.fillWidth: true
                        label: "New Password"
                        placeholderText: "Enter new password"
                        echoMode: TextInput.Password
                        text: newPassword
                        onTextChanged: newPassword = text
                    }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Confirm New Password"
                        placeholderText: "Re-enter new password"
                        echoMode: TextInput.Password
                        text: confirmPassword
                        onTextChanged: confirmPassword = text
                    }

                    CAlert {
                        Layout.fillWidth: true
                        severity: "info"
                        text: "Passwords must be at least 8 characters with uppercase, lowercase, and a number."
                        visible: newPassword.length > 0
                    }

                    CAlert {
                        Layout.fillWidth: true
                        severity: "error"
                        text: "Passwords do not match."
                        visible: confirmPassword.length > 0 && newPassword !== confirmPassword
                    }
                }
            }

            // Connected accounts
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    CText { variant: "h4"; text: "Connected Accounts" }
                    CDivider { Layout.fillWidth: true }

                    CListItem {
                        Layout.fillWidth: true
                        title: "GitHub"
                        subtitle: "Linked as @" + appWindow.currentUser
                        leadingIcon: "github"
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        Layout.leftMargin: 12
                        spacing: 8
                        CStatusBadge { status: "success"; text: "Connected" }
                        Item { Layout.fillWidth: true }
                        CButton { text: "Unlink"; variant: "ghost"; size: "sm" }
                    }

                    CDivider { Layout.fillWidth: true }

                    CListItem {
                        Layout.fillWidth: true
                        title: "Discord"
                        subtitle: "Not linked"
                        leadingIcon: "discord"
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        Layout.leftMargin: 12
                        spacing: 8
                        CStatusBadge { status: "warning"; text: "Not Connected" }
                        Item { Layout.fillWidth: true }
                        CButton { text: "Link Account"; variant: "primary"; size: "sm" }
                    }
                }
            }

            // Save button
            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Save Changes"
                    variant: "primary"
                    onClicked: {
                        console.log("Profile saved for", appWindow.currentUser)
                    }
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 20 }
        }
    }
}
