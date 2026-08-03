// AppLogic.js — auth + navigation logic for
// App.qml

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    try {
        xhr.open("GET", Qt.resolvedUrl(relativePath),
            false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText)
    } catch(e) {}
    return null
}

function logout(app, dbalProvider) {
    app.currentUser = ""
    app.currentRole = "public"
    app.currentLevel = 1
    app.loggedIn = false
    app.authToken = ""
    dbalProvider.authToken = ""
    app.currentView = "frontpage"
}

function viewIndex(app) {
    var view = app.currentView
    var staticIdx = app.staticViews.indexOf(view)
    if (staticIdx >= 0) return staticIdx
    var navPkgs = PackageLoader
        ? PackageLoader.navigablePackages() : []
    for (var i = 0; i < navPkgs.length; i++) {
        var pkg = navPkgs[i]
        var viewName = packageViewName(pkg)
        if (viewName === view
            || pkg.packageId === view)
            return app.staticViews.length + i
    }
    return 0
}

function packageViewName(pkg) {
    return pkg.navLabel
        ? pkg.navLabel.toLowerCase()
            .replace(/ /g, "-")
        : pkg.packageId
}

function autoLogin(app, dbalProvider) {
    app.appConfig = loadJson(
        "../../config/app-config.json")
    if (typeof Theme.setTheme === "function")
        Theme.setTheme(app.currentTheme)
    if (app.authToken !== "") {
        dbalProvider.authToken = app.authToken
        dbalProvider.execute(
            "core/auth/validate",
            { token: app.authToken },
            function(result, error) {
            if (!error && result
                && result.valid) {
                app.currentUser =
                    result.username || ""
                app.currentRole =
                    result.role || "user"
                app.currentLevel =
                    result.level || 2
                app.loggedIn = true
                app.currentView = "dashboard"
            } else {
                app.authToken = ""
                dbalProvider.authToken = ""
            }
        })
    }
}
