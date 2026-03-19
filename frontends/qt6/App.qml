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
            Repeater {
                model: [
                    { label: "Home",   level: 1, view: "frontpage" },
                    { label: "User",   level: 2, view: "dashboard" },
                    { label: "Mod",    level: 3, view: "moderator" },
                    { label: "Admin",  level: 4, view: "admin" },
                    { label: "God",    level: 5, view: "god-panel" },
                    { label: "Super",  level: 6, view: "supergod" }
                ]
                delegate: CButton {
                    visible: modelData.level <= currentLevel
                    text: modelData.label
                    variant: currentView === modelData.view ? "default" : "text"
                    size: "sm"
                    onClicked: currentView = modelData.view
                }
            }

            Item { Layout.fillWidth: true }

            Item { width: 4 }

            // Language selector
            Rectangle {
                visible: loggedIn
                width: langText.implicitWidth + 20
                height: 28
                radius: 14
                color: surfaceContainer
                border.color: outlineVariant
                border.width: 1

                CText {
                    id: langText
                    anchors.centerIn: parent
                    text: "EN"
                    font.pixelSize: 11
                    font.weight: Font.Bold
                    font.family: "monospace"
                    color: Theme.textSecondary
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    // TODO: language picker popup
                }
            }

            // Alerts bell
            Rectangle {
                visible: loggedIn
                width: 32
                height: 32
                radius: 16
                color: bellMA.containsMouse ? surfaceContainer : "transparent"

                CText {
                    anchors.centerIn: parent
                    text: "\uD83D\uDD14"
                    font.pixelSize: 16
                }

                // Notification dot
                Rectangle {
                    visible: true
                    anchors.top: parent.top
                    anchors.right: parent.right
                    anchors.topMargin: 2
                    anchors.rightMargin: 4
                    width: 8
                    height: 8
                    radius: 4
                    color: "#F43F5E"
                }

                MouseArea {
                    id: bellMA
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    // TODO: notification panel
                }
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
            Rectangle {
                id: userAvatar
                visible: loggedIn
                width: 32
                height: 32
                radius: 16
                color: avatarMA.containsMouse
                    ? Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.25 : 0.2)
                    : Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.15 : 0.12)

                Behavior on color { ColorAnimation { duration: 150 } }

                CText {
                    anchors.centerIn: parent
                    text: currentUser ? currentUser.charAt(0).toUpperCase() : "?"
                    font.pixelSize: 14
                    font.weight: Font.Bold
                    color: "#6366F1"
                }

                MouseArea {
                    id: avatarMA
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: userMenu.visible = !userMenu.visible
                }

                // Dropdown menu
                Rectangle {
                    id: userMenu
                    visible: false
                    anchors.top: parent.bottom
                    anchors.right: parent.right
                    anchors.topMargin: 8
                    width: 200
                    height: menuCol.implicitHeight + 16
                    radius: 12
                    color: Theme.paper
                    border.color: isDark ? Qt.rgba(1,1,1,0.1) : Qt.rgba(0,0,0,0.1)
                    border.width: 1
                    z: 100

                    ColumnLayout {
                        id: menuCol
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.top: parent.top
                        anchors.margins: 8
                        spacing: 2

                        // User info header
                        RowLayout {
                            Layout.fillWidth: true
                            Layout.margins: 8
                            spacing: 10

                            Rectangle {
                                width: 36
                                height: 36
                                radius: 18
                                color: Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.2 : 0.15)

                                CText {
                                    anchors.centerIn: parent
                                    text: currentUser ? currentUser.charAt(0).toUpperCase() : "?"
                                    font.pixelSize: 16
                                    font.weight: Font.Bold
                                    color: "#6366F1"
                                }
                            }

                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 1
                                CText {
                                    text: currentUser
                                    font.pixelSize: 14
                                    font.weight: Font.DemiBold
                                }
                                CText {
                                    text: "L" + currentLevel + " \u00B7 " + currentRole
                                    font.pixelSize: 11
                                    font.family: "monospace"
                                    color: Theme.textSecondary
                                }
                            }
                        }

                        // Divider
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.leftMargin: 8
                            Layout.rightMargin: 8
                            height: 1
                            color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.06)
                        }

                        // Menu items
                        Repeater {
                            model: [
                                { label: "Profile",  icon: "P", view: "profile" },
                                { label: "Settings", icon: "S", view: "settings" }
                            ]
                            delegate: Rectangle {
                                Layout.fillWidth: true
                                height: 36
                                radius: 8
                                color: menuItemMA.containsMouse ? (isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.04)) : "transparent"

                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: 12
                                    spacing: 10
                                    CText {
                                        text: modelData.icon
                                        font.pixelSize: 14
                                        color: Theme.textSecondary
                                    }
                                    CText {
                                        text: modelData.label
                                        font.pixelSize: 13
                                    }
                                }

                                MouseArea {
                                    id: menuItemMA
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: {
                                        currentView = modelData.view
                                        userMenu.visible = false
                                    }
                                }
                            }
                        }

                        // Divider
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.leftMargin: 8
                            Layout.rightMargin: 8
                            height: 1
                            color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.06)
                        }

                        // Logout
                        Rectangle {
                            Layout.fillWidth: true
                            height: 36
                            radius: 8
                            color: logoutMA.containsMouse ? Qt.rgba(0.96, 0.25, 0.37, 0.08) : "transparent"

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12
                                spacing: 10
                                CText {
                                    text: "\u2192"
                                    font.pixelSize: 14
                                    color: "#F43F5E"
                                }
                                CText {
                                    text: "Sign out"
                                    font.pixelSize: 13
                                    color: "#F43F5E"
                                }
                            }

                            MouseArea {
                                id: logoutMA
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    userMenu.visible = false
                                    logout()
                                }
                            }
                        }
                    }
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
                            { label: "Mod Tools",   view: "moderator",   icon: "M", level: 3 },
                            { label: "Admin Panel", view: "admin",       icon: "A", level: 4 },
                            { label: "God Panel",   view: "god-panel",   icon: "G", level: 5 },
                            { label: "Super God",   view: "supergod",    icon: "S", level: 6 }
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
