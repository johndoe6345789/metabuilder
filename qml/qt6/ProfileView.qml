import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/ProfileDBAL.js"
    as PDBAL

Rectangle {
    id: profileRoot; color: Theme.background
    objectName: "view_profile"
    Accessible.role: Accessible.Pane
    Accessible.name: "Profile"
    DBALProvider { id: dbal }
    readonly property bool isDark:
        Theme.mode === "dark"
    readonly property color onSurfaceVariant:
        Theme.textSecondary
    property var profileConfig: null
    property string userBio: ""
    property string userEmail: ""
    property string userDisplayName:
        appWindow.currentUser
    property var passwords:
        ({ "current": "", "new": "",
           "confirm": "" })
    property bool saving: false
    property string saveStatus: ""

    function saveProfile() {
        saving = true; saveStatus = ""
        var data = profileForm.getData()
        userDisplayName = data.displayName
        userEmail = data.email
        userBio = data.bio
        PDBAL.saveProfile(dbal,
            appWindow.currentUser, data,
            function(ok) {
                saving = false
                saveStatus =
                    ok ? "saved" : "error"
            })
    }
    Component.onCompleted: {
        profileConfig = PDBAL.loadJson(
            Qt.resolvedUrl(
                "config/profile-mock.json"))
        if (profileConfig
                && profileConfig.defaults) {
            userBio = profileConfig
                .defaults.bio || ""
            userEmail = profileConfig
                .defaults.email || ""
        }
        dbal.ping(function(success) {
            if (!success) return
            PDBAL.loadProfile(dbal,
                appWindow.currentUser,
                function(r) {
                    if (r.bio) userBio = r.bio
                    if (r.email)
                        userEmail = r.email
                    if (r.displayName)
                        userDisplayName =
                            r.displayName
                })
        })
    }

    ScrollView {
        anchors.fill: parent; clip: true
        contentWidth: availableWidth
        ColumnLayout {
            width: parent.width; spacing: 0
            Item { Layout.preferredHeight: 24 }
            CProfileHeader {
                username: appWindow.currentUser
                level: 2
                role: appWindow.currentRole
                email: profileRoot.userEmail
                isDark: profileRoot.isDark
            }
            Item { Layout.preferredHeight: 16 }
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
                Item {
                    Layout.preferredHeight: 8
                }
                CDivider {
                    Layout.fillWidth: true
                }
                Item {
                    Layout.preferredHeight: 12
                }
                FlexRow {
                    Layout.fillWidth: true
                    spacing: 16
                    Repeater {
                        model: profileConfig
                            ? profileConfig
                                .activityStats
                            : []
                        delegate: CCard {
                            Layout.fillWidth: true
                            variant: "outlined"
                            CText {
                                Layout.fillWidth:
                                    true
                                variant: "caption"
                                text: modelData
                                    .label
                                color:
                                    onSurfaceVariant
                            }
                            Item {
                                Layout
                                .preferredHeight:
                                    4
                            }
                            CText {
                                Layout.fillWidth:
                                    true
                                variant: "h4"
                                text: modelData
                                    .value
                            }
                        }
                    }
                }
            }
            Item { Layout.preferredHeight: 16 }
            CProfileForm {
                id: profileForm
                profile: ({
                    displayName: profileRoot
                        .userDisplayName,
                    email: profileRoot
                        .userEmail,
                    bio: profileRoot.userBio
                })
                isDark: profileRoot.isDark
            }
            Item { Layout.preferredHeight: 16 }
            CProfilePasswordCard {
                passwordFields: profileConfig
                    ? profileConfig
                        .passwordFields : []
                passwords: profileRoot.passwords
                onPasswordChanged:
                    function(key, value) {
                    var p = passwords
                    p[key] = value; passwords = p
                }
            }
            Item { Layout.preferredHeight: 16 }
            CProfileConnectedAccounts {
                accounts: profileConfig
                    ? profileConfig
                        .connectedAccounts : []
                currentUser:
                    appWindow.currentUser
            }
            Item { Layout.preferredHeight: 16 }
            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 12
                Item { Layout.fillWidth: true }
                CButton {
                    text: saving ? "Saving..."
                        : "Save Changes"
                    variant: "primary"
                    enabled: !saving
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: saving
                        ? "Saving profile"
                        : "Save profile changes"
                    Keys.onReturnPressed:
                        profileRoot.saveProfile()
                    Keys.onSpacePressed:
                        profileRoot.saveProfile()
                    onClicked:
                        profileRoot.saveProfile()
                }
            }
            Item { Layout.preferredHeight: 24 }
        }
    }
}
