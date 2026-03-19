import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: "transparent"

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    property bool useLiveData: dbal.connected

    // ── Profile state ────────────────────────────────────────────
    property string displayName: appWindow.currentUser
    property string userEmail: appWindow.currentUser + "@metabuilder.io"
    property bool profileSaved: false

    // ── Appearance state ─────────────────────────────────────────
    property var availableThemes: [
        { id: "dark",           label: "Dark" },
        { id: "light",          label: "Light" },
        { id: "midnight",       label: "Midnight" },
        { id: "solarized",      label: "Solarized" },
        { id: "nord",           label: "Nord" },
        { id: "dracula",        label: "Dracula" },
        { id: "monokai",        label: "Monokai" },
        { id: "github",         label: "GitHub" },
        { id: "high-contrast",  label: "High Contrast" }
    ]
    property string selectedTheme: appWindow.currentTheme
    property string fontSize: "medium"

    // ── Notification preferences ─────────────────────────────────
    property bool emailNotifications: true
    property bool desktopNotifications: true
    property bool soundAlerts: false

    // ── Connection state ─────────────────────────────────────────
    property string dbalUrl: dbal.baseUrl
    property string mediaServiceUrl: "http://localhost:9090"
    property string dbalConnectionStatus: dbal.connected ? "connected" : "disconnected"
    property string mediaConnectionStatus: "unknown"

    // ── Helpers ──────────────────────────────────────────────────
    function userInitials() {
        var name = appWindow.currentUser
        if (!name || name.length === 0) return "??"
        var parts = name.split(" ")
        if (parts.length >= 2)
            return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.substring(0, 2).toUpperCase()
    }

    function saveProfile() {
        if (useLiveData) {
            dbal.update("user", appWindow.currentUser, {
                displayName: displayName,
                email: userEmail
            }, function(result, error) {
                if (!error) {
                    profileSaved = true
                    profileSavedTimer.restart()
                }
            })
        } else {
            profileSaved = true
            profileSavedTimer.restart()
            console.log("[Settings] Profile saved (offline):", displayName, userEmail)
        }
    }

    function savePreferences() {
        if (useLiveData) {
            dbal.update("user", appWindow.currentUser, {
                preferences: {
                    theme: selectedTheme,
                    fontSize: fontSize,
                    emailNotifications: emailNotifications,
                    desktopNotifications: desktopNotifications,
                    soundAlerts: soundAlerts
                }
            }, function(result, error) {
                if (!error) console.log("[Settings] Preferences saved to DBAL")
            })
        }
    }

    function testDBALConnection() {
        dbalConnectionStatus = "testing"
        dbal.baseUrl = dbalUrl
        dbal.ping(function(success, error) {
            dbalConnectionStatus = success ? "connected" : "disconnected"
        })
    }

    function testMediaConnection() {
        mediaConnectionStatus = "testing"
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                mediaConnectionStatus = (xhr.status >= 200 && xhr.status < 300) ? "connected" : "disconnected"
            }
        }
        xhr.open("GET", mediaServiceUrl + "/health")
        xhr.send()
    }

    function connectionStatusColor(status) {
        switch (status) {
            case "connected":    return "success"
            case "disconnected": return "error"
            case "testing":      return "warning"
            default:             return "info"
        }
    }

    function connectionStatusLabel(status) {
        switch (status) {
            case "connected":    return "Connected"
            case "disconnected": return "Disconnected"
            case "testing":      return "Testing..."
            default:             return "Unknown"
        }
    }

    // ── Load preferences from DBAL ───────────────────────────────
    function loadPreferences() {
        if (!useLiveData) return
        dbal.findFirst("user", { username: appWindow.currentUser }, function(result, error) {
            if (error || !result) return
            var items = result.items || []
            if (items.length === 0) return
            var user = items[0]
            if (user.displayName) displayName = user.displayName
            if (user.email) userEmail = user.email
            if (user.preferences) {
                if (user.preferences.theme) selectedTheme = user.preferences.theme
                if (user.preferences.fontSize) fontSize = user.preferences.fontSize
                if (user.preferences.emailNotifications !== undefined) emailNotifications = user.preferences.emailNotifications
                if (user.preferences.desktopNotifications !== undefined) desktopNotifications = user.preferences.desktopNotifications
                if (user.preferences.soundAlerts !== undefined) soundAlerts = user.preferences.soundAlerts
            }
        })
    }

    Component.onCompleted: {
        if (useLiveData) loadPreferences()
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadPreferences()
    }

    Timer {
        id: profileSavedTimer
        interval: 3000
        onTriggered: profileSaved = false
    }

    // ── UI ───────────────────────────────────────────────────────
    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 20

            // Page title
            CText {
                variant: "h3"
                text: "Settings"
            }

            // ── Profile Section ─────────────────────────────────
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Profile" }
                    CDivider { Layout.fillWidth: true }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 16

                        // Avatar
                        Rectangle {
                            width: 64
                            height: 64
                            radius: 32
                            color: Theme.primary
                            Layout.alignment: Qt.AlignTop

                            CText {
                                anchors.centerIn: parent
                                text: userInitials()
                                variant: "h4"
                                color: "#ffffff"
                                font.bold: true
                            }
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
                                text: appWindow.currentRole + " \u00b7 Level " + appWindow.currentLevel
                                opacity: 0.7
                            }
                        }
                    }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Display Name"
                        placeholderText: "Enter display name"
                        text: displayName
                        onTextChanged: displayName = text
                    }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Email"
                        placeholderText: "Enter email address"
                        text: userEmail
                        onTextChanged: userEmail = text
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        Item { Layout.fillWidth: true }

                        CAlert {
                            visible: profileSaved
                            severity: "success"
                            text: "Profile saved successfully"
                        }

                        CButton {
                            text: "Save Profile"
                            variant: "primary"
                            onClicked: saveProfile()
                        }
                    }
                }
            }

            // ── Appearance Section ──────────────────────────────
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Appearance" }
                    CDivider { Layout.fillWidth: true }

                    // Theme selector
                    CText {
                        variant: "subtitle2"
                        text: "Theme"
                    }

                    Flow {
                        Layout.fillWidth: true
                        spacing: 8

                        Repeater {
                            model: availableThemes
                            delegate: CButton {
                                text: modelData.label
                                variant: selectedTheme === modelData.id ? "primary" : "default"
                                size: "sm"
                                onClicked: {
                                    selectedTheme = modelData.id
                                    appWindow.currentTheme = modelData.id
                                    if (typeof Theme.setTheme === "function") {
                                        Theme.setTheme(modelData.id)
                                    }
                                    savePreferences()
                                }
                            }
                        }
                    }

                    // Font size selector
                    CText {
                        variant: "subtitle2"
                        text: "Font Size"
                        Layout.topMargin: 8
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        Repeater {
                            model: [
                                { id: "small",  label: "Small"  },
                                { id: "medium", label: "Medium" },
                                { id: "large",  label: "Large"  }
                            ]
                            delegate: CButton {
                                text: modelData.label
                                variant: fontSize === modelData.id ? "primary" : "default"
                                size: "sm"
                                onClicked: {
                                    fontSize = modelData.id
                                    savePreferences()
                                }
                            }
                        }
                    }
                }
            }

            // ── Notifications Section ───────────────────────────
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Notifications" }
                    CDivider { Layout.fillWidth: true }

                    // Email notifications toggle
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 2
                            CText { variant: "subtitle2"; text: "Email Notifications" }
                            CText { variant: "caption"; text: "Receive notification summaries via email"; opacity: 0.6 }
                        }

                        Switch {
                            checked: emailNotifications
                            onCheckedChanged: {
                                emailNotifications = checked
                                savePreferences()
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Desktop notifications toggle
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 2
                            CText { variant: "subtitle2"; text: "Desktop Notifications" }
                            CText { variant: "caption"; text: "Show desktop push notifications for alerts"; opacity: 0.6 }
                        }

                        Switch {
                            checked: desktopNotifications
                            onCheckedChanged: {
                                desktopNotifications = checked
                                savePreferences()
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Sound alerts toggle
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 2
                            CText { variant: "subtitle2"; text: "Sound Alerts" }
                            CText { variant: "caption"; text: "Play a sound when new notifications arrive"; opacity: 0.6 }
                        }

                        Switch {
                            checked: soundAlerts
                            onCheckedChanged: {
                                soundAlerts = checked
                                savePreferences()
                            }
                        }
                    }
                }
            }

            // ── Connection Section ──────────────────────────────
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Connection" }
                    CDivider { Layout.fillWidth: true }

                    // DBAL URL
                    CText { variant: "subtitle2"; text: "DBAL Server" }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CTextField {
                            Layout.fillWidth: true
                            label: "DBAL URL"
                            placeholderText: "http://localhost:8080"
                            text: dbalUrl
                            onTextChanged: dbalUrl = text
                        }

                        ColumnLayout {
                            spacing: 4
                            Layout.alignment: Qt.AlignBottom

                            CButton {
                                text: dbalConnectionStatus === "testing" ? "Testing..." : "Test Connection"
                                variant: "default"
                                size: "sm"
                                enabled: dbalConnectionStatus !== "testing"
                                onClicked: testDBALConnection()
                            }

                            CStatusBadge {
                                status: connectionStatusColor(dbalConnectionStatus)
                                text: connectionStatusLabel(dbalConnectionStatus)
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Media Service URL
                    CText { variant: "subtitle2"; text: "Media Service" }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CTextField {
                            Layout.fillWidth: true
                            label: "Media Service URL"
                            placeholderText: "http://localhost:9090"
                            text: mediaServiceUrl
                            onTextChanged: mediaServiceUrl = text
                        }

                        ColumnLayout {
                            spacing: 4
                            Layout.alignment: Qt.AlignBottom

                            CButton {
                                text: mediaConnectionStatus === "testing" ? "Testing..." : "Test Connection"
                                variant: "default"
                                size: "sm"
                                enabled: mediaConnectionStatus !== "testing"
                                onClicked: testMediaConnection()
                            }

                            CStatusBadge {
                                status: connectionStatusColor(mediaConnectionStatus)
                                text: connectionStatusLabel(mediaConnectionStatus)
                            }
                        }
                    }
                }
            }

            // ── About Section ───────────────────────────────────
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    CText { variant: "h4"; text: "About" }
                    CDivider { Layout.fillWidth: true }

                    Repeater {
                        model: [
                            { label: "Version",     value: "2.1.0" },
                            { label: "Build Date",  value: "2026-03-19" },
                            { label: "Qt Version",  value: "6.8.x" },
                            { label: "Platform",    value: Qt.platform.os },
                            { label: "DBAL Schema", value: "v1 REST API" }
                        ]

                        delegate: FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CText {
                                variant: "body2"
                                text: modelData.label
                                opacity: 0.6
                                Layout.preferredWidth: 120
                            }

                            CText {
                                variant: "body1"
                                text: modelData.value
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CButton {
                            text: "View Documentation"
                            variant: "default"
                            size: "sm"
                            onClicked: Qt.openUrlExternally("https://github.com/nicholasgriffintn/metabuilder")
                        }

                        CButton {
                            text: "Report Issue"
                            variant: "ghost"
                            size: "sm"
                            onClicked: Qt.openUrlExternally("https://github.com/nicholasgriffintn/metabuilder/issues")
                        }
                    }
                }
            }

            // ── Data status footer ──────────────────────────────
            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                CText {
                    variant: "caption"
                    text: useLiveData ? "Connected to DBAL — preferences synced" : "Offline — preferences stored locally"
                    opacity: 0.4
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 20 }
        }
    }
}
