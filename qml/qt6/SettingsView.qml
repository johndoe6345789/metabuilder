import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: "transparent"

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    // ── JSON config ──────────────────────────────────────────────
    function loadJson(path) {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(path), false); xhr.send()
        return xhr.status === 200 ? JSON.parse(xhr.responseText) : null
    }
    property var notificationConfig: loadJson("config/settings-notifications.json") || []
    property var aboutConfig:        loadJson("config/settings-about.json") || []
    property var fontSizeConfig:     loadJson("config/settings-font-sizes.json") || []

    // ── State ────────────────────────────────────────────────────
    property string displayName: appWindow.currentUser
    property string userEmail: appWindow.currentUser + "@metabuilder.io"
    property bool profileSaved: false
    property string selectedTheme: appWindow.currentTheme
    property string fontSize: "medium"
    property var notifValues: ({ emailNotifications: true, desktopNotifications: true, soundAlerts: false })

    function userInitials() {
        var n = appWindow.currentUser
        if (!n || n.length === 0) return "??"
        var p = n.split(" ")
        return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.substring(0, 2).toUpperCase()
    }

    // ── DBAL persistence ─────────────────────────────────────────
    function saveProfile() {
        var onSaved = function() { profileSaved = true; profileSavedTimer.restart() }
        if (useLiveData) {
            dbal.update("user", appWindow.currentUser,
                { displayName: displayName, email: userEmail },
                function(r, e) { if (!e) onSaved() })
        } else { onSaved(); console.log("[Settings] Profile saved (offline):", displayName, userEmail) }
    }

    function savePreferences() {
        if (!useLiveData) return
        dbal.update("user", appWindow.currentUser, {
            preferences: { theme: selectedTheme, fontSize: fontSize,
                emailNotifications: notifValues.emailNotifications,
                desktopNotifications: notifValues.desktopNotifications,
                soundAlerts: notifValues.soundAlerts }
        }, function(r, e) { if (!e) console.log("[Settings] Preferences saved to DBAL") })
    }

    function loadPreferences() {
        if (!useLiveData) return
        dbal.findFirst("user", { username: appWindow.currentUser }, function(result, error) {
            if (error || !result) return
            var items = result.items || []; if (items.length === 0) return
            var u = items[0]
            if (u.displayName) displayName = u.displayName
            if (u.email) userEmail = u.email
            if (u.preferences) {
                if (u.preferences.theme) selectedTheme = u.preferences.theme
                if (u.preferences.fontSize) fontSize = u.preferences.fontSize
                var nv = JSON.parse(JSON.stringify(notifValues))
                if (u.preferences.emailNotifications !== undefined) nv.emailNotifications = u.preferences.emailNotifications
                if (u.preferences.desktopNotifications !== undefined) nv.desktopNotifications = u.preferences.desktopNotifications
                if (u.preferences.soundAlerts !== undefined) nv.soundAlerts = u.preferences.soundAlerts
                notifValues = nv
            }
        })
    }

    Component.onCompleted: { if (useLiveData) loadPreferences() }
    onUseLiveDataChanged: { if (useLiveData) loadPreferences() }
    Timer { id: profileSavedTimer; interval: 3000; onTriggered: profileSaved = false }

    // ── UI ───────────────────────────────────────────────────────
    ScrollView {
        anchors.fill: parent; anchors.margins: 24; clip: true
        ColumnLayout {
            width: parent.width; spacing: 20

            CText { variant: "h3"; text: "Settings" }

            // Profile
            CSettingsSection {
                title: "Profile"
                FlexRow {
                    Layout.fillWidth: true; Layout.topMargin: 4; spacing: 16
                    CAvatar { size: "lg"; initials: userInitials() }
                    ColumnLayout {
                        Layout.fillWidth: true; spacing: 4
                        CText { variant: "subtitle1"; text: appWindow.currentUser; font.bold: true }
                        CText { variant: "body2"; text: appWindow.currentRole + " \u00b7 Level " + appWindow.currentLevel; opacity: 0.7 }
                    }
                }
                CTextField { Layout.fillWidth: true; Layout.topMargin: 8; label: "Display Name"; placeholderText: "Enter display name"; text: displayName; onTextChanged: displayName = text }
                CTextField { Layout.fillWidth: true; label: "Email"; placeholderText: "Enter email address"; text: userEmail; onTextChanged: userEmail = text }
                FlexRow {
                    Layout.fillWidth: true; spacing: 12
                    Item { Layout.fillWidth: true }
                    CAlert { visible: profileSaved; severity: "success"; text: "Profile saved successfully" }
                    CButton { text: "Save Profile"; variant: "primary"; onClicked: saveProfile() }
                }
            }

            // Appearance
            CSettingsSection {
                title: "Appearance"
                CThemePicker {
                    Layout.fillWidth: true; currentTheme: root.selectedTheme
                    onThemeSelected: function(name) {
                        root.selectedTheme = name; appWindow.currentTheme = name
                        if (typeof Theme.setTheme === "function") Theme.setTheme(name)
                        savePreferences()
                    }
                }
                CText { variant: "subtitle2"; text: "Font Size"; Layout.topMargin: 8 }
                FlexRow {
                    Layout.fillWidth: true; spacing: 8
                    Repeater {
                        model: fontSizeConfig
                        delegate: CButton {
                            text: modelData.label; variant: fontSize === modelData.id ? "primary" : "default"; size: "sm"
                            onClicked: { fontSize = modelData.id; savePreferences() }
                        }
                    }
                }
            }

            // Notifications
            CSettingsSection {
                title: "Notifications"
                CNotificationToggles {
                    Layout.fillWidth: true; model: notificationConfig; values: notifValues
                    onToggled: function(id, value) {
                        var nv = JSON.parse(JSON.stringify(notifValues)); nv[id] = value; notifValues = nv; savePreferences()
                    }
                }
            }

            // Connection
            CSettingsSection {
                title: "Connection"
                CConnectionTest { Layout.fillWidth: true }
            }

            // About
            CSettingsSection {
                title: "About"
                Repeater {
                    model: aboutConfig
                    delegate: FlexRow {
                        Layout.fillWidth: true; spacing: 12
                        CText { variant: "body2"; text: modelData.label; opacity: 0.6; Layout.preferredWidth: 120 }
                        CText { variant: "body1"; text: modelData.value }
                    }
                }
                FlexRow {
                    Layout.fillWidth: true; spacing: 12
                    CText { variant: "body2"; text: "Platform"; opacity: 0.6; Layout.preferredWidth: 120 }
                    CText { variant: "body1"; text: Qt.platform.os }
                }
                CDivider { Layout.fillWidth: true }
                FlexRow {
                    Layout.fillWidth: true; spacing: 12
                    CButton { text: "View Documentation"; variant: "default"; size: "sm"; onClicked: Qt.openUrlExternally("https://github.com/nicholasgriffintn/metabuilder") }
                    CButton { text: "Report Issue"; variant: "ghost"; size: "sm"; onClicked: Qt.openUrlExternally("https://github.com/nicholasgriffintn/metabuilder/issues") }
                }
            }

            CText { variant: "caption"; text: useLiveData ? "Connected to DBAL \u2014 preferences synced" : "Offline \u2014 preferences stored locally"; opacity: 0.4 }
            Item { Layout.preferredHeight: 20 }
        }
    }
}
