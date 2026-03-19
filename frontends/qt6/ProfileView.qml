import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: profileRoot
    color: Theme.background

    DBALProvider { id: dbal }

    readonly property bool isDark: Theme.mode === "dark"
    readonly property color onSurfaceVariant: Theme.textSecondary

    property var profileConfig: null
    function loadJson(relativePath) {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(relativePath), false)
        xhr.send()
        if (xhr.status === 200) return JSON.parse(xhr.responseText)
        return null
    }

    // ── Profile state ──
    property string userBio: ""
    property string userEmail: ""
    property string userDisplayName: appWindow.currentUser
    property var passwords: ({ "current": "", "new": "", "confirm": "" })
    property bool saving: false
    property string saveStatus: ""

    // ── DBAL operations ──
    function loadProfile() {
        if (!appWindow.currentUser) return;
        dbal.read("user", appWindow.currentUser, function(result, error) {
            if (result) {
                if (result.bio) userBio = result.bio;
                if (result.email) userEmail = result.email;
                if (result.displayName) userDisplayName = result.displayName;
            }
        });
    }

    function saveProfile() {
        saving = true; saveStatus = "";
        var data = profileForm.getData();
        userDisplayName = data.displayName; userEmail = data.email; userBio = data.bio;
        dbal.update("user", appWindow.currentUser, data, function(result, error) {
            saving = false;
            saveStatus = result ? "saved" : "error";
            if (result) console.log("Profile saved for", appWindow.currentUser);
            else console.warn("Profile save failed:", error);
        });
    }

    function changePassword() {
        if (passwords["new"] !== passwords["confirm"]) return;
        dbal.execute("core/change-password", {
            userId: appWindow.currentUser,
            oldPassword: passwords["current"],
            newPassword: passwords["new"]
        }, function(result, error) {
            if (result) {
                passwords = { "current": "", "new": "", "confirm": "" };
                console.log("Password changed successfully");
            } else { console.warn("Password change failed:", error); }
        });
    }

    Component.onCompleted: {
        profileConfig = loadJson("config/profile-mock.json");
        if (profileConfig && profileConfig.defaults) {
            userBio = profileConfig.defaults.bio || "";
            userEmail = profileConfig.defaults.email || "";
        }
        dbal.ping(function(success) { if (success) loadProfile(); });
    }

    ScrollView {
        anchors.fill: parent; clip: true; contentWidth: availableWidth
        ColumnLayout {
            width: parent.width; spacing: 0

            Item { Layout.preferredHeight: 24 }
            CProfileHeader {
                username: appWindow.currentUser; level: 2
                role: appWindow.currentRole; email: profileRoot.userEmail
                isDark: profileRoot.isDark
            }
            Item { Layout.preferredHeight: 16 }

            // ── Activity summary ──
            CCard {
                Layout.fillWidth: true; Layout.leftMargin: 24; Layout.rightMargin: 24; variant: "filled"
                CText { Layout.fillWidth: true; variant: "h4"; text: "Activity Summary" }
                Item { Layout.preferredHeight: 8 }
                CDivider { Layout.fillWidth: true }
                Item { Layout.preferredHeight: 12 }
                FlexRow {
                    Layout.fillWidth: true; spacing: 16
                    Repeater {
                        model: profileConfig ? profileConfig.activityStats : []
                        delegate: CCard {
                            Layout.fillWidth: true; variant: "outlined"
                            CText { Layout.fillWidth: true; variant: "caption"; text: modelData.label; color: onSurfaceVariant }
                            Item { Layout.preferredHeight: 4 }
                            CText { Layout.fillWidth: true; variant: "h4"; text: modelData.value }
                        }
                    }
                }
            }
            Item { Layout.preferredHeight: 16 }

            // ── Edit profile ──
            CProfileForm {
                id: profileForm
                profile: ({ displayName: profileRoot.userDisplayName, email: profileRoot.userEmail, bio: profileRoot.userBio })
                isDark: profileRoot.isDark
            }
            Item { Layout.preferredHeight: 16 }

            // ── Change password ──
            CCard {
                Layout.fillWidth: true; Layout.leftMargin: 24; Layout.rightMargin: 24; variant: "filled"
                CText { Layout.fillWidth: true; variant: "h4"; text: "Change Password" }
                Item { Layout.preferredHeight: 8 }
                CDivider { Layout.fillWidth: true }
                Item { Layout.preferredHeight: 14 }
                Repeater {
                    model: profileConfig ? profileConfig.passwordFields : []
                    delegate: ColumnLayout {
                        Layout.fillWidth: true; spacing: 0
                        CTextField {
                            Layout.fillWidth: true
                            label: modelData.label
                            placeholderText: modelData.placeholder
                            echoMode: TextInput.Password
                            text: passwords[modelData.key]
                            onTextChanged: { var p = passwords; p[modelData.key] = text; passwords = p; }
                        }
                        Item { Layout.preferredHeight: 14 }
                    }
                }
                CAlert {
                    Layout.fillWidth: true; severity: "info"
                    text: "Passwords must be at least 8 characters with uppercase, lowercase, and a number."
                    visible: passwords["new"].length > 0
                }
                CAlert {
                    Layout.fillWidth: true; severity: "error"
                    text: "Passwords do not match."
                    visible: passwords["confirm"].length > 0 && passwords["new"] !== passwords["confirm"]
                }
            }
            Item { Layout.preferredHeight: 16 }

            // ── Connected accounts ──
            CCard {
                Layout.fillWidth: true; Layout.leftMargin: 24; Layout.rightMargin: 24; variant: "filled"
                CText { Layout.fillWidth: true; variant: "h4"; text: "Connected Accounts" }
                Item { Layout.preferredHeight: 8 }
                CDivider { Layout.fillWidth: true }
                Item { Layout.preferredHeight: 8 }
                Repeater {
                    model: profileConfig ? profileConfig.connectedAccounts : []
                    delegate: ColumnLayout {
                        Layout.fillWidth: true; spacing: 0
                        CListItem {
                            Layout.fillWidth: true; title: modelData.service
                            subtitle: modelData.linked ? "Linked as @" + appWindow.currentUser : "Not linked"
                            leadingIcon: modelData.icon
                        }
                        FlexRow {
                            Layout.fillWidth: true; Layout.leftMargin: 12; spacing: 8
                            CStatusBadge { status: modelData.statusType; text: modelData.statusText }
                            Item { Layout.fillWidth: true }
                            CButton {
                                text: modelData.linked ? (modelData.unlinkLabel || "Unlink") : (modelData.linkLabel || "Link Account")
                                variant: modelData.linked ? "ghost" : "primary"; size: "sm"
                            }
                        }
                        Item { Layout.preferredHeight: 8; visible: index < (profileConfig.connectedAccounts.length - 1) }
                        CDivider { Layout.fillWidth: true; visible: index < (profileConfig.connectedAccounts.length - 1) }
                        Item { Layout.preferredHeight: 8; visible: index < (profileConfig.connectedAccounts.length - 1) }
                    }
                }
            }
            Item { Layout.preferredHeight: 16 }

            // ── Save button ──
            FlexRow {
                Layout.fillWidth: true; Layout.leftMargin: 24; Layout.rightMargin: 24; spacing: 12
                Item { Layout.fillWidth: true }
                CButton {
                    text: saving ? "Saving..." : "Save Changes"
                    variant: "primary"; enabled: !saving
                    onClicked: profileRoot.saveProfile()
                }
            }
            Item { Layout.preferredHeight: 24 }
        }
    }
}
