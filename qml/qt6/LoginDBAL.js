// LoginDBAL.js — DBAL login logic and dev credential data for LoginView

function devCredentials(palette) {
    return [
        { user: "demo",  pass: "demo",     label: "User",      level: 2, accent: palette.blue },
        { user: "mod",   pass: "mod",      label: "Moderator", level: 3, accent: palette.cyan },
        { user: "admin", pass: "admin",    label: "Admin",     level: 4, accent: palette.amber },
        { user: "god",   pass: "god123",   label: "God",       level: 5, accent: palette.violet },
        { user: "super", pass: "super123", label: "Super God", level: 6, accent: palette.rose }
    ]
}

function loginWithDBAL(dbal, username, password, callbacks) {
    callbacks.onStart()
    dbal.execute("core/auth/login", { username: username, password: password }, function(result, error) {
        if (!error && result && result.token) {
            callbacks.onSuccess(result, username)
        } else {
            callbacks.onFallback(username, password, error)
        }
    })
}
