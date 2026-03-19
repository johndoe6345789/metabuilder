import QtQuick

Item {
    id: shortcuts
    objectName: "keyboard_shortcuts"
    Accessible.role: Accessible.Pane
    Accessible.name: "Keyboard Shortcuts"

    required property var appWindow

    // Accessible descriptions for each shortcut
    readonly property var shortcutDefs: [
        { action: "Command palette", keys: "Ctrl+K" },
        { action: "Login or logout", keys: "Ctrl+L" },
        { action: "Front page", keys: "Ctrl+1" },
        { action: "Dashboard", keys: "Ctrl+2" },
        { action: "Moderator panel", keys: "Ctrl+3" },
        { action: "Admin panel", keys: "Ctrl+4" },
        { action: "God panel", keys: "Ctrl+5" },
        { action: "Super God panel", keys: "Ctrl+6" },
        { action: "Go back or dismiss", keys: "Escape" }
    ]

    Repeater {
        model: shortcuts.shortcutDefs
        Item {
            visible: false
            Accessible.role: Accessible.StaticText
            Accessible.name: modelData.action
                + ": " + modelData.keys
        }
    }

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
