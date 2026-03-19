// SettingsLogic.js — DBAL persistence for
// SettingsView

function userInitials(username) {
    if (!username || username.length === 0)
        return "??"
    var p = username.split(" ")
    return p.length >= 2
        ? (p[0][0] + p[1][0]).toUpperCase()
        : username.substring(0, 2).toUpperCase()
}

function saveProfile(root, dbal) {
    var onSaved = function() {
        root.profileSaved = true
        root.profileSavedTimer.restart()
    }
    if (root.useLiveData) {
        dbal.update("user",
            root.appWindow.currentUser,
            {
                displayName: root.displayName,
                email: root.userEmail
            },
            function(r, e) {
                if (!e) onSaved()
            })
    } else {
        onSaved()
        console.log(
            "[Settings] Profile saved (offline):",
            root.displayName, root.userEmail)
    }
}

function savePreferences(root, dbal) {
    if (!root.useLiveData) return
    dbal.update("user",
        root.appWindow.currentUser, {
        preferences: {
            theme: root.selectedTheme,
            fontSize: root.fontSize,
            emailNotifications:
                root.notifValues
                    .emailNotifications,
            desktopNotifications:
                root.notifValues
                    .desktopNotifications,
            soundAlerts:
                root.notifValues.soundAlerts
        }
    }, function(r, e) {
        if (!e)
            console.log(
                "[Settings] Preferences"
                + " saved to DBAL")
    })
}

function loadPreferences(root, dbal) {
    if (!root.useLiveData) return
    dbal.findFirst("user",
        { username: root.appWindow.currentUser },
        function(result, error) {
        if (error || !result) return
        var items = result.items || []
        if (items.length === 0) return
        var u = items[0]
        if (u.displayName)
            root.displayName = u.displayName
        if (u.email)
            root.userEmail = u.email
        if (u.preferences) {
            if (u.preferences.theme)
                root.selectedTheme =
                    u.preferences.theme
            if (u.preferences.fontSize)
                root.fontSize =
                    u.preferences.fontSize
            var nv = JSON.parse(
                JSON.stringify(root.notifValues))
            if (u.preferences
                .emailNotifications
                !== undefined)
                nv.emailNotifications =
                    u.preferences
                        .emailNotifications
            if (u.preferences
                .desktopNotifications
                !== undefined)
                nv.desktopNotifications =
                    u.preferences
                        .desktopNotifications
            if (u.preferences.soundAlerts
                !== undefined)
                nv.soundAlerts =
                    u.preferences.soundAlerts
            root.notifValues = nv
        }
    })
}
