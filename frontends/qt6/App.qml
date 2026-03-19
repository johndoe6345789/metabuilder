import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt.labs.settings 1.0
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

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

    // Seed users — 6-level hierarchy
    property var users: [
        { username: "demo",  password: "demo",     role: "user",      level: 2 },
        { username: "mod",   password: "mod",       role: "moderator", level: 3 },
        { username: "admin", password: "admin",     role: "admin",     level: 4 },
        { username: "god",   password: "god123",    role: "god",       level: 5 },
        { username: "super", password: "super123",  role: "supergod",  level: 6 }
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

    // ── Static view registry (fixed indices 0–9) ──
    readonly property var staticViews: [
        "frontpage", "login", "dashboard", "profile",
        "moderator", "admin", "god-panel", "supergod", "settings", "comments"
    ]

    // ── Dynamic view index computation ──
    function viewIndex(view) {
        var staticIdx = staticViews.indexOf(view)
        if (staticIdx >= 0)
            return staticIdx

        var navPkgs = PackageLoader.navigablePackages()
        for (var i = 0; i < navPkgs.length; i++) {
            var pkg = navPkgs[i]
            var viewName = pkg.navLabel ? pkg.navLabel.toLowerCase().replace(/ /g, "-") : pkg.packageId
            if (viewName === view || pkg.packageId === view)
                return staticViews.length + i
        }

        return 0
    }

    function packageViewName(pkg) {
        return pkg.navLabel ? pkg.navLabel.toLowerCase().replace(/ /g, "-") : pkg.packageId
    }

    // ── MD3 palette helpers ──
    readonly property bool isDark: Theme.mode === "dark"

    // ── App bar ──
    header: CAppBar {
        height: 48

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 16
            anchors.rightMargin: 12
            spacing: 6

            // Logo + DBAL status
            CText {
                text: "MetaBuilder"
                font.pixelSize: 15
                font.weight: Font.Bold
                font.letterSpacing: -0.5
            }

            Rectangle {
                width: 6
                height: 6
                radius: 3
                color: dbalProvider.connected ? "#22C55E" : "#F43F5E"
                Layout.leftMargin: 2
            }

            Item { Layout.fillWidth: true }

            // Level navigation — center
            CNavBar {
                currentView: appWindow.currentView
                currentLevel: appWindow.currentLevel
                onNavigate: function(view) { appWindow.currentView = view }
            }

            Item { Layout.fillWidth: true }

            Item { width: 4 }

            // Language selector
            CLanguageSelector {
                visible: loggedIn
                isDark: appWindow.isDark
            }

            // Notification bell
            CNotificationBell {
                visible: loggedIn
                isDark: appWindow.isDark
                hasNotifications: true
            }

            // Login button (not logged in)
            CButton {
                visible: !loggedIn
                text: "Login"
                variant: "primary"
                size: "sm"
                onClicked: currentView = "login"
            }

            // User avatar with dropdown (logged in)
            CUserMenu {
                visible: loggedIn
                username: currentUser
                level: currentLevel
                role: currentRole
                isDark: appWindow.isDark
                onNavigateTo: function(view) { appWindow.currentView = view }
                onSignOut: logout()
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
        CSidebar {
            currentView: appWindow.currentView
            currentLevel: appWindow.currentLevel
            loggedIn: appWindow.loggedIn
            Layout.preferredWidth: 220
            Layout.fillHeight: true
            packageViewName: appWindow.packageViewName
            onNavigate: function(view) { appWindow.currentView = view }
        }

        // ── Main content ──
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "transparent"

            StackLayout {
                anchors.fill: parent
                currentIndex: viewIndex(currentView)

                // Static views (indices 0–9)
                FrontPage {}         // 0: Public/Guest landing
                LoginView {}         // 1: Login
                DashboardView {}     // 2: User dashboard
                ProfileView {}       // 3: Profile
                ModeratorView {}     // 4: Moderator tools
                AdminView {}         // 5: Admin panel
                GodPanel {}          // 6: God Panel (14-tab builder)
                SuperGodPanel {}     // 7: Super God Panel
                SettingsView {}      // 8: Settings
                CommentsView {}      // 9: Comments

                // Dynamic package views (indices 9+)
                Repeater {
                    model: PackageLoader.navigablePackages()
                    delegate: PackageViewLoader {
                        packageId: modelData.packageId
                    }
                }
            }
        }
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

    // ── Restore persisted theme ──
    onCurrentThemeChanged: {
        if (typeof Theme.setTheme === "function") {
            Theme.setTheme(currentTheme)
        }
    }

    // ── Auto-login with persisted token ──
    Component.onCompleted: {
        if (typeof Theme.setTheme === "function") {
            Theme.setTheme(currentTheme)
        }

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
        onActivated: if (currentLevel >= 3) currentView = "moderator"
    }

    Shortcut {
        sequence: "Ctrl+4"
        onActivated: if (currentLevel >= 4) currentView = "admin"
    }

    Shortcut {
        sequence: "Ctrl+5"
        onActivated: if (currentLevel >= 5) currentView = "god-panel"
    }

    Shortcut {
        sequence: "Ctrl+6"
        onActivated: if (currentLevel >= 6) currentView = "supergod"
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
