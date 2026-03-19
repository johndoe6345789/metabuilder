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

    // ── Static view registry (fixed indices 0–8) ──
    readonly property var staticViews: [
        "frontpage", "login", "dashboard", "profile",
        "admin", "god-panel", "supergod", "settings", "comments"
    ]

    // ── Dynamic view index computation ──
    function viewIndex(view) {
        // Check static views first (indices 0–8)
        var staticIdx = staticViews.indexOf(view)
        if (staticIdx >= 0)
            return staticIdx

        // Check dynamic package views (indices 9+)
        var navPkgs = PackageLoader.navigablePackages()
        for (var i = 0; i < navPkgs.length; i++) {
            var pkg = navPkgs[i]
            var viewName = pkg.navLabel ? pkg.navLabel.toLowerCase().replace(/ /g, "-") : pkg.packageId
            if (viewName === view || pkg.packageId === view)
                return staticViews.length + i
        }

        return 0
    }

    // Convert packageId to view name for navigation
    function packageViewName(pkg) {
        return pkg.navLabel ? pkg.navLabel.toLowerCase().replace(/ /g, "-") : pkg.packageId
    }

    // ── MD3 palette helpers (match FrontPage) ──
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color accentBlue: "#6366F1"
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color outlineVariant: isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    // ── App bar ──
    header: CAppBar {
        height: 52

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 16
            anchors.rightMargin: 16
            spacing: 8

            // Logo
            CText {
                text: "MetaBuilder"
                font.pixelSize: 16
                font.weight: Font.Bold
                font.letterSpacing: -0.5
            }

            // Level pill
            Rectangle {
                width: lvlText.implicitWidth + 16
                height: 24
                radius: 12
                color: Qt.rgba(accentBlue.r, accentBlue.g, accentBlue.b, isDark ? 0.15 : 0.12)

                CText {
                    id: lvlText
                    anchors.centerIn: parent
                    text: "L" + currentLevel
                    font.pixelSize: 11
                    font.weight: Font.Bold
                    font.family: "monospace"
                    color: accentBlue
                }
            }

            // DBAL dot
            Rectangle {
                width: 7
                height: 7
                radius: 3.5
                color: dbalProvider.connected ? accentBlue : "#f44336"
                Layout.leftMargin: 4
            }
            CText {
                text: "DBAL"
                font.pixelSize: 11
                font.family: "monospace"
                color: Theme.textSecondary
            }

            // Theme toggle — MD3 icon-style pill
            Rectangle {
                width: themeText.implicitWidth + 20
                height: 28
                radius: 14
                color: surfaceContainer
                border.color: outlineVariant
                border.width: 1

                CText {
                    id: themeText
                    anchors.centerIn: parent
                    text: currentTheme === "dark" ? "\u263E Dark" : "\u2600 Light"
                    font.pixelSize: 11
                    color: Theme.textSecondary
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        currentTheme = currentTheme === "dark" ? "light" : "dark"
                        if (typeof Theme.setTheme === "function")
                            Theme.setTheme(currentTheme)
                    }
                }
            }

            Item { Layout.fillWidth: true }

            // Level navigation — MD3 segmented/pill buttons
            Repeater {
                model: [
                    { label: "Public",    level: 1, view: "frontpage" },
                    { label: "User",      level: 2, view: "dashboard" },
                    { label: "Admin",     level: 3, view: "admin" },
                    { label: "God",       level: 4, view: "god-panel" },
                    { label: "Super",     level: 5, view: "supergod" }
                ]
                delegate: Rectangle {
                    visible: modelData.level <= currentLevel
                    width: navLabel.implicitWidth + 20
                    height: 30
                    radius: 15
                    color: currentView === modelData.view
                        ? Qt.rgba(accentBlue.r, accentBlue.g, accentBlue.b, isDark ? 0.2 : 0.15)
                        : navMA.containsMouse ? surfaceContainer : "transparent"

                    Behavior on color { ColorAnimation { duration: 150 } }

                    CText {
                        id: navLabel
                        anchors.centerIn: parent
                        text: modelData.label
                        font.pixelSize: 12
                        font.weight: currentView === modelData.view ? Font.DemiBold : Font.Normal
                        color: currentView === modelData.view ? accentBlue : Theme.textSecondary
                    }

                    MouseArea {
                        id: navMA
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: currentView = modelData.view
                    }
                }
            }

            Item { width: 4 }

            // Login / user info
            Rectangle {
                visible: !loggedIn
                width: loginText.implicitWidth + 24
                height: 30
                radius: 15
                color: accentBlue

                CText {
                    id: loginText
                    anchors.centerIn: parent
                    text: "Login"
                    font.pixelSize: 12
                    font.weight: Font.DemiBold
                    color: "#ffffff"
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: currentView = "login"
                }
            }

            CText {
                visible: loggedIn
                text: currentUser
                font.pixelSize: 13
                font.weight: Font.Medium
                color: Theme.text
            }

            Rectangle {
                visible: loggedIn
                width: logoutText.implicitWidth + 20
                height: 28
                radius: 14
                color: "transparent"
                border.color: outlineVariant
                border.width: 1

                CText {
                    id: logoutText
                    anchors.centerIn: parent
                    text: "Logout"
                    font.pixelSize: 11
                    color: Theme.textSecondary
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: logout()
                }
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

                // Static core nav items
                Repeater {
                    model: {
                        var items = [
                            { label: "Dashboard",   view: "dashboard",   icon: "~", level: 2 },
                            { label: "Profile",     view: "profile",     icon: "P", level: 2 },
                            { label: "Comments",    view: "comments",    icon: "C", level: 2 },
                            { label: "Admin Panel", view: "admin",       icon: "A", level: 3 },
                            { label: "God Panel",   view: "god-panel",   icon: "G", level: 4 },
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

                // Dynamic package nav items (from PackageLoader)
                Repeater {
                    model: {
                        var navPkgs = PackageLoader.navigablePackages()
                        return navPkgs.filter(function(pkg) {
                            var lvl = pkg.level ? pkg.level : 2
                            return lvl <= currentLevel
                        })
                    }

                    delegate: CListItem {
                        Layout.fillWidth: true
                        title: modelData.navLabel ? modelData.navLabel : modelData.name
                        leadingIcon: modelData.icon ? modelData.icon : modelData.name.charAt(0)
                        selected: currentView === packageViewName(modelData)
                        onClicked: currentView = packageViewName(modelData)
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

                // Static views (indices 0–8)
                FrontPage {}         // 0: Public landing
                LoginView {}         // 1: Login
                DashboardView {}     // 2: Dashboard
                ProfileView {}       // 3: Profile
                AdminView {}         // 4: Admin
                GodPanel {}          // 5: God Panel (13-tab builder)
                SuperGodPanel {}     // 6: Super God Panel
                SettingsView {}      // 7: Settings
                CommentsView {}      // 8: Comments

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
        // Apply saved theme on startup
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
