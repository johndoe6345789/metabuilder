import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: profileRoot
    color: Theme.background

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    // ── MD3 palette ──────────────────────────────────────────────
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color surfaceContainerHigh: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    // ── Mock fallback data ───────────────────────────────────────
    property string mockBio: "MetaBuilder enthusiast and open-source contributor."
    property string mockEmail: "demo@metabuilder.io"

    property string userBio: mockBio
    property string userEmail: mockEmail
    property string userDisplayName: appWindow.currentUser
    property string currentPassword: ""
    property string newPassword: ""
    property string confirmPassword: ""
    property bool saving: false
    property string saveStatus: ""

    // ── DBAL data loading ────────────────────────────────────────
    function loadProfile() {
        if (!appWindow.currentUser) return;
        dbal.read("user", appWindow.currentUser, function(result, error) {
            if (result) {
                if (result.bio) userBio = result.bio;
                if (result.email) userEmail = result.email;
                if (result.displayName) userDisplayName = result.displayName;
            }
            // On error, keep existing mock data
        });
    }

    function saveProfile() {
        saving = true;
        saveStatus = "";
        var profileData = {
            displayName: userDisplayName,
            email: userEmail,
            bio: userBio
        };
        dbal.update("user", appWindow.currentUser, profileData, function(result, error) {
            saving = false;
            if (result) {
                saveStatus = "saved";
                console.log("Profile saved for", appWindow.currentUser);
            } else {
                saveStatus = "error";
                console.warn("Profile save failed:", error);
            }
        });
    }

    function changePassword() {
        if (newPassword !== confirmPassword) return;
        dbal.execute("core/change-password", {
            userId: appWindow.currentUser,
            oldPassword: currentPassword,
            newPassword: newPassword
        }, function(result, error) {
            if (result) {
                currentPassword = "";
                newPassword = "";
                confirmPassword = "";
                console.log("Password changed successfully");
            } else {
                console.warn("Password change failed:", error);
            }
        });
    }

    Component.onCompleted: {
        dbal.ping(function(success) {
            if (success) loadProfile();
        });
    }

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
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 24 }

            // ── Profile header card ──────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

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
                            Layout.fillWidth: true
                            variant: "h3"
                            text: appWindow.currentUser
                        }

                        CText {
                            Layout.fillWidth: true
                            variant: "body2"
                            text: userEmail
                            color: onSurfaceVariant
                        }

                        FlexRow {
                            spacing: 8
                            CBadge { text: appWindow.currentRole; badgeColor: Theme.primary }
                            CBadge { text: "Level 2"; badgeColor: Theme.info }
                        }

                        CText {
                            Layout.fillWidth: true
                            variant: "caption"
                            text: "Member since January 15, 2026"
                            color: onSurfaceVariant
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 16 }

            // ── Activity summary ─────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "Activity Summary"
                }

                Item { Layout.preferredHeight: 8 }

                CDivider { Layout.fillWidth: true }

                Item { Layout.preferredHeight: 12 }

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
                            variant: "outlined"

                            CText {
                                Layout.fillWidth: true
                                variant: "caption"
                                text: modelData.label
                                color: onSurfaceVariant
                            }

                            Item { Layout.preferredHeight: 4 }

                            CText {
                                Layout.fillWidth: true
                                variant: "h4"
                                text: modelData.value
                            }
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 16 }

            // ── Edit profile ─────────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "Edit Profile"
                }

                Item { Layout.preferredHeight: 8 }

                CDivider { Layout.fillWidth: true }

                Item { Layout.preferredHeight: 14 }

                CTextField {
                    Layout.fillWidth: true
                    label: "Display Name"
                    placeholderText: "Enter display name"
                    text: userDisplayName
                    onTextChanged: userDisplayName = text
                }

                Item { Layout.preferredHeight: 14 }

                CTextField {
                    Layout.fillWidth: true
                    label: "Email"
                    placeholderText: "Enter email address"
                    text: userEmail
                    onTextChanged: userEmail = text
                }

                Item { Layout.preferredHeight: 14 }

                CTextField {
                    Layout.fillWidth: true
                    label: "Bio"
                    placeholderText: "Tell us about yourself..."
                    text: userBio
                    onTextChanged: userBio = text
                }
            }

            Item { Layout.preferredHeight: 16 }

            // ── Change password ───────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "Change Password"
                }

                Item { Layout.preferredHeight: 8 }

                CDivider { Layout.fillWidth: true }

                Item { Layout.preferredHeight: 14 }

                CTextField {
                    Layout.fillWidth: true
                    label: "Current Password"
                    placeholderText: "Enter current password"
                    echoMode: TextInput.Password
                    text: currentPassword
                    onTextChanged: currentPassword = text
                }

                Item { Layout.preferredHeight: 14 }

                CTextField {
                    Layout.fillWidth: true
                    label: "New Password"
                    placeholderText: "Enter new password"
                    echoMode: TextInput.Password
                    text: newPassword
                    onTextChanged: newPassword = text
                }

                Item { Layout.preferredHeight: 14 }

                CTextField {
                    Layout.fillWidth: true
                    label: "Confirm New Password"
                    placeholderText: "Re-enter new password"
                    echoMode: TextInput.Password
                    text: confirmPassword
                    onTextChanged: confirmPassword = text
                }

                Item { Layout.preferredHeight: 14 }

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

            Item { Layout.preferredHeight: 16 }

            // ── Connected accounts ────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                variant: "filled"

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "Connected Accounts"
                }

                Item { Layout.preferredHeight: 8 }

                CDivider { Layout.fillWidth: true }

                Item { Layout.preferredHeight: 8 }

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

                Item { Layout.preferredHeight: 8 }

                CDivider { Layout.fillWidth: true }

                Item { Layout.preferredHeight: 8 }

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

            Item { Layout.preferredHeight: 16 }

            // ── Save button ──────────────────────────────────────
            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 12
                Item { Layout.fillWidth: true }
                CButton {
                    text: saving ? "Saving..." : "Save Changes"
                    variant: "primary"
                    enabled: !saving
                    onClicked: saveProfile()
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 24 }
        }
    }
}
