import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/SettingsLogic.js" as Logic

Rectangle {
    id: root
    color: "transparent"
    objectName: "view_settings"
    Accessible.role: Accessible.Pane
    Accessible.name: "Settings"

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    function loadJson(path) {
        var xhr = new XMLHttpRequest()
        try {
            xhr.open("GET", Qt.resolvedUrl(path), false)
            xhr.send()
            if (xhr.status === 200 || xhr.status === 0)
                return JSON.parse(xhr.responseText)
        } catch(e) {}
        return null
    }
    property var notificationConfig:
        loadJson("config/settings-notifications.json")
        || []
    property var aboutConfig:
        loadJson("config/settings-about.json") || []
    property var fontSizeConfig:
        loadJson("config/settings-font-sizes.json")
        || []

    property string displayName:
        appWindow.currentUser
    property string userEmail:
        appWindow.currentUser + "@metabuilder.io"
    property bool profileSaved: false
    property string selectedTheme:
        appWindow.currentTheme
    property string fontSize: "medium"
    property var notifValues: ({
        emailNotifications: true,
        desktopNotifications: true,
        soundAlerts: false
    })
    property alias profileSavedTimer:
        _profileSavedTimer

    Component.onCompleted: {
        if (useLiveData)
            Logic.loadPreferences(root, dbal)
    }
    onUseLiveDataChanged: {
        if (useLiveData)
            Logic.loadPreferences(root, dbal)
    }
    Timer {
        id: _profileSavedTimer
        interval: 3000
        onTriggered: profileSaved = false
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24; clip: true
        ColumnLayout {
            width: parent.width; spacing: 20
            CText {
                variant: "h3"; text: "Settings"
            }

            CSettingsSection {
                title: "Profile"
                FlexRow {
                    Layout.fillWidth: true
                    Layout.topMargin: 4; spacing: 16
                    CAvatar {
                        size: "lg"
                        initials: Logic.userInitials(
                            appWindow.currentUser
                        )
                    }
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        CText {
                            variant: "subtitle1"
                            text: appWindow.currentUser
                            font.bold: true
                        }
                        CText {
                            variant: "body2"
                            text: appWindow.currentRole
                                + " \u00b7 Level "
                                + appWindow.currentLevel
                            opacity: 0.7
                        }
                    }
                }
                CTextField {
                    Layout.fillWidth: true
                    Layout.topMargin: 8
                    label: "Display Name"
                    placeholderText: "Enter display name"
                    text: displayName
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Display Name"
                    onTextChanged: displayName = text
                }
                CTextField {
                    Layout.fillWidth: true
                    label: "Email"
                    placeholderText: "Enter email address"
                    text: userEmail
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Email address"
                    onTextChanged: userEmail = text
                }
                FlexRow {
                    Layout.fillWidth: true
                    spacing: 12
                    Item { Layout.fillWidth: true }
                    CAlert {
                        visible: profileSaved
                        severity: "success"
                        text: "Profile saved"
                            + " successfully"
                    }
                    CButton {
                        text: "Save Profile"
                        variant: "primary"
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Save profile"
                        Keys.onReturnPressed:
                            Logic.saveProfile(root, dbal)
                        onClicked:
                            Logic.saveProfile(root, dbal)
                    }
                }
            }

            CSettingsSection {
                title: "Appearance"
                CThemePicker {
                    Layout.fillWidth: true
                    currentTheme: root.selectedTheme
                    onThemeSelected: function(name) {
                        root.selectedTheme = name
                        appWindow.currentTheme = name
                        if (typeof Theme.setTheme
                            === "function")
                            Theme.setTheme(name)
                        Logic.savePreferences(
                            root, dbal
                        )
                    }
                }
                CText {
                    variant: "subtitle2"
                    text: "Font Size"
                    Layout.topMargin: 8
                }
                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8
                    Repeater {
                        model: fontSizeConfig
                        delegate: CButton {
                            text: modelData.label
                            variant: fontSize
                                === modelData.id
                                ? "primary" : "default"
                            size: "sm"
                            activeFocusOnTab: true
                            Accessible.role: Accessible.RadioButton
                            Accessible.name: "Font size: "
                                + modelData.label
                            Accessible.checked:
                                fontSize === modelData.id
                            Keys.onReturnPressed: {
                                fontSize = modelData.id
                                Logic.savePreferences(root, dbal)
                            }
                            onClicked: {
                                fontSize = modelData.id
                                Logic.savePreferences(root, dbal)
                            }
                        }
                    }
                }
            }

            CSettingsSection {
                title: "Notifications"
                CNotificationToggles {
                    Layout.fillWidth: true
                    model: notificationConfig
                    values: notifValues
                    onToggled: function(id, value) {
                        var nv = JSON.parse(
                            JSON.stringify(notifValues)
                        )
                        nv[id] = value
                        notifValues = nv
                        Logic.savePreferences(
                            root, dbal
                        )
                    }
                }
            }

            CSettingsSection {
                title: "Connection"
                CConnectionTest {
                    Layout.fillWidth: true
                }
            }

            CSettingsAbout {
                aboutConfig: root.aboutConfig
            }

            CText {
                variant: "caption"
                text: useLiveData
                    ? "Connected to DBAL"
                        + " \u2014 preferences synced"
                    : "Offline \u2014 preferences"
                        + " stored locally"
                opacity: 0.4
            }
            Item { Layout.preferredHeight: 20 }
        }
    }
}
