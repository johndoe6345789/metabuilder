import QtQuick

Item {
    id: shortcuts

    required property var appWindow

    Shortcut {
        sequence: "Ctrl+K"
        onActivated: console.log(
            "[MetaBuilder] Command palette"
            + " (Ctrl+K) — not yet implemented")
    }
    Shortcut {
        sequence: "Ctrl+L"
        onActivated: {
            if (appWindow.loggedIn)
                appWindow.logout()
            else
                appWindow.currentView = "login"
        }
    }
    Shortcut {
        sequence: "Ctrl+1"
        onActivated:
            appWindow.currentView = "frontpage"
    }
    Shortcut {
        sequence: "Ctrl+2"
        onActivated:
            if (appWindow.currentLevel >= 2)
                appWindow.currentView = "dashboard"
    }
    Shortcut {
        sequence: "Ctrl+3"
        onActivated:
            if (appWindow.currentLevel >= 3)
                appWindow.currentView = "moderator"
    }
    Shortcut {
        sequence: "Ctrl+4"
        onActivated:
            if (appWindow.currentLevel >= 4)
                appWindow.currentView = "admin"
    }
    Shortcut {
        sequence: "Ctrl+5"
        onActivated:
            if (appWindow.currentLevel >= 5)
                appWindow.currentView = "god-panel"
    }
    Shortcut {
        sequence: "Ctrl+6"
        onActivated:
            if (appWindow.currentLevel >= 6)
                appWindow.currentView = "supergod"
    }
    Shortcut {
        sequence: "Escape"
        onActivated: {
            if (appWindow.currentView === "login")
                appWindow.currentView = "frontpage"
            else if (appWindow.loggedIn
                     && appWindow.currentView
                         !== "dashboard")
                appWindow.currentView = "dashboard"
            else if (!appWindow.loggedIn
                     && appWindow.currentView
                         !== "frontpage")
                appWindow.currentView = "frontpage"
        }
    }
}
