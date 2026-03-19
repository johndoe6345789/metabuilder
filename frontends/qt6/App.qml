import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt.labs.settings 1.0
import QmlComponents 1.0
import "qmllib/dbal"

ApplicationWindow {
    id: appWindow
    visible: true
    width: 1400
    height: 900
    title: "MetaBuilder Observatory"
    color: Theme.background

    // ── DBAL connection ──
    DBALProvider {
        id: dbalProvider
    }

    // ── Theme ──
    property string currentTheme: "dark"

    // ── DBAL offline detection ──
    property bool dbalConnected: dbalProvider.connected

    // ── Auth state ──
    property int currentLevel: 1
    property string currentUser: ""
    property string currentRole: "public"
    property bool loggedIn: false
    property string authToken: ""
    property string currentView: "frontpage"

    // Seed users (mirrors old/ seed data)
    property var users: [
        { username: "demo",  password: "demo",     role: "user",     level: 2 },
        { username: "admin", password: "admin",     role: "admin",    level: 3 },
        { username: "god",   password: "god123",    role: "god",      level: 4 },
        { username: "super", password: "super123",  role: "supergod", level: 5 }
    ]

    function login(username, password) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === username && users[i].password === password) {
                currentUser = username
                currentRole = users[i].role
                currentLevel = users[i].level
                loggedIn = true
                currentView = "dashboard"
                return true
            }
        }
        return false
    }

    function logout() {
        currentUser = ""
        currentRole = "public"
        currentLevel = 1
        loggedIn = false
        authToken = ""
        dbalProvider.authToken = ""
        currentView = "frontpage"
    }

    // ── App bar ──
    header: CAppBar {
        height: 56

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 20
            anchors.rightMargin: 20
            spacing: 12

            CText {
                variant: "h4"
                text: "MetaBuilder"
            }

            CBadge {
                text: "Level " + currentLevel
            }

            // DBAL connection status
            Row {
                spacing: 4
                Layout.leftMargin: 4

                Rectangle {
                    width: 8
                    height: 8
                    radius: 4
                    color: dbalProvider.connected ? "#4caf50" : "#f44336"
                    anchors.verticalCenter: parent.verticalCenter
                }

                CText {
                    variant: "caption"
                    text: "DBAL"
                    anchors.verticalCenter: parent.verticalCenter
                }
            }

            // Theme toggle
            CButton {
                variant: "ghost"
                size: "sm"
                text: currentTheme === "dark" ? "Light" : "Dark"
                onClicked: {
                    currentTheme = currentTheme === "dark" ? "light" : "dark"
                    if (typeof Theme.setTheme === "function") {
                        Theme.setTheme(currentTheme)
                    }
                }
            }

            Item { Layout.fillWidth: true }

            // Level navigation
            Repeater {
                model: [
                    { label: "Public",    level: 1, view: "frontpage" },
                    { label: "User",      level: 2, view: "dashboard" },
                    { label: "Admin",     level: 3, view: "admin" },
                    { label: "God",       level: 4, view: "god-panel" },
                    { label: "Super God", level: 5, view: "supergod" }
                ]
                delegate: CButton {
                    visible: modelData.level <= currentLevel
                    text: modelData.label
                    variant: currentView === modelData.view ? "primary" : "ghost"
                    size: "sm"
                    onClicked: currentView = modelData.view
                }
            }

            Item { width: 8 }

            CButton {
                visible: !loggedIn
                text: "Login"
                variant: "primary"
                size: "sm"
                onClicked: currentView = "login"
            }
            CText {
                visible: loggedIn
                text: currentUser + " (" + currentRole + ")"
                variant: "body2"
            }
            CButton {
                visible: loggedIn
                text: "Logout"
                variant: "ghost"
                size: "sm"
                onClicked: logout()
            }
        }
    }

    // ── DBAL offline banner ──
    Rectangle {
        id: dbalBanner
        visible: !dbalConnected
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 28
        color: "#e65100"
        z: 10

        CText {
            anchors.centerIn: parent
            text: "DBAL Offline — showing cached data"
            variant: "caption"
            color: "#ffffff"
        }
    }

    // ── Sidebar + Content ──
    RowLayout {
        anchors.fill: parent
        anchors.topMargin: dbalBanner.visible ? 28 : 0
        spacing: 0

        // Sidebar (Level 2+)
        Rectangle {
            visible: loggedIn
            Layout.preferredWidth: 220
            Layout.fillHeight: true
            color: Theme.paper
            border.color: Theme.border
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 4

                CText {
                    variant: "subtitle2"
                    text: "Navigation"
                    Layout.bottomMargin: 8
                }

                Repeater {
                    model: {
                        var items = [
                            { label: "Dashboard",   view: "dashboard",   icon: "~", level: 2 },
                            { label: "Profile",     view: "profile",     icon: "P", level: 2 },
                            { label: "Forum",       view: "forum",       icon: "F", level: 2 },
                            { label: "Gallery",     view: "gallery",     icon: "G", level: 2 },
                            { label: "Guestbook",   view: "guestbook",   icon: "B", level: 2 },
                            { label: "Blog",        view: "blog",        icon: "W", level: 2 },
                            { label: "Comments",    view: "comments",    icon: "C", level: 2 },
                            { label: "Admin Panel", view: "admin",       icon: "A", level: 3 },
                            { label: "Analytics",   view: "analytics",   icon: "A", level: 3 },
                            { label: "Watchtower",  view: "watchtower",  icon: "W", level: 3 },
                            { label: "God Panel",   view: "god-panel",   icon: "G", level: 4 },
                            { label: "Packages",    view: "packages",    icon: "P", level: 4 },
                            { label: "Storybook",   view: "storybook",   icon: "S", level: 4 },
                            { label: "Super God",   view: "supergod",    icon: "S", level: 5 }
                        ]
                        return items.filter(function(item) { return item.level <= currentLevel })
                    }

                    delegate: CListItem {
                        Layout.fillWidth: true
                        title: modelData.label
                        leadingIcon: modelData.icon
                        selected: currentView === modelData.view
                        onClicked: currentView = modelData.view
                    }
                }

                Item { Layout.fillHeight: true }

                CDivider { Layout.fillWidth: true }

                CListItem {
                    Layout.fillWidth: true
                    title: "Settings"
                    leadingIcon: "S"
                    selected: currentView === "settings"
                    onClicked: currentView = "settings"
                }
            }
        }

        // ── Main content ──
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "transparent"

            StackLayout {
                anchors.fill: parent
                currentIndex: viewIndex(currentView)

                FrontPage {}         // 0: Public landing
                LoginView {}         // 1: Login
                DashboardView {}     // 2: Dashboard
                ProfileView {}       // 3: Profile
                PackageViewLoader { packageId: "forum" }             // 4
                PackageViewLoader { packageId: "gallery" }           // 5
                PackageViewLoader { packageId: "guestbook" }         // 6
                PackageViewLoader { packageId: "blog" }              // 7
                AdminView {}         // 8: Admin
                PackageViewLoader { packageId: "analytics" }         // 9
                PackageViewLoader { packageId: "watchtower" }        // 10
                GodPanel {}          // 11: God Panel (13-tab builder)
                PackageManager {}    // 12: Package Manager
                Storybook {}         // 13: Storybook
                SuperGodPanel {}     // 14: Super God Panel
                SettingsView {}      // 15: Settings
                CommentsView {}      // 16: Comments
            }
        }
    }

    function viewIndex(view) {
        var views = [
            "frontpage", "login", "dashboard", "profile", "forum",
            "gallery", "guestbook", "blog", "admin", "analytics",
            "watchtower", "god-panel", "packages", "storybook",
            "supergod", "settings", "comments"
        ]
        var idx = views.indexOf(view)
        return idx >= 0 ? idx : 0
    }

    // ── Window state persistence ──
    Settings {
        id: windowSettings
        category: "MetaBuilder"
        property alias windowWidth: appWindow.width
        property alias windowHeight: appWindow.height
        property alias windowX: appWindow.x
        property alias windowY: appWindow.y
        property alias theme: appWindow.currentTheme
        property alias authToken: appWindow.authToken
    }

    // ── Auto-login with persisted token ──
    Component.onCompleted: {
        if (authToken !== "") {
            dbalProvider.authToken = authToken
            dbalProvider.execute("core/auth/validate", { token: authToken }, function(result, error) {
                if (!error && result && result.valid) {
                    currentUser = result.username || ""
                    currentRole = result.role || "user"
                    currentLevel = result.level || 2
                    loggedIn = true
                    currentView = "dashboard"
                } else {
                    // Token invalid or expired — clear it
                    authToken = ""
                    dbalProvider.authToken = ""
                }
            })
        }
    }

    // ── Keyboard shortcuts ──
    Shortcut {
        sequence: "Ctrl+K"
        onActivated: console.log("[MetaBuilder] Command palette (Ctrl+K) — not yet implemented")
    }

    Shortcut {
        sequence: "Ctrl+L"
        onActivated: {
            if (loggedIn) {
                logout()
            } else {
                currentView = "login"
            }
        }
    }

    Shortcut {
        sequence: "Ctrl+1"
        onActivated: currentView = "frontpage"
    }

    Shortcut {
        sequence: "Ctrl+2"
        onActivated: if (currentLevel >= 2) currentView = "dashboard"
    }

    Shortcut {
        sequence: "Ctrl+3"
        onActivated: if (currentLevel >= 3) currentView = "admin"
    }

    Shortcut {
        sequence: "Ctrl+4"
        onActivated: if (currentLevel >= 4) currentView = "god-panel"
    }

    Shortcut {
        sequence: "Ctrl+5"
        onActivated: if (currentLevel >= 5) currentView = "supergod"
    }

    Shortcut {
        sequence: "Escape"
        onActivated: {
            if (currentView === "login") {
                currentView = "frontpage"
            } else if (loggedIn && currentView !== "dashboard") {
                currentView = "dashboard"
            } else if (!loggedIn && currentView !== "frontpage") {
                currentView = "frontpage"
            }
        }
    }
}
