// FrontPageLogic.js — data loading + DBAL
// integration for FrontPage

function loadJson(path) {
    var xhr = new XMLHttpRequest()
    try {
        xhr.open("GET", Qt.resolvedUrl(path), false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText)
    } catch(e) {}
    return null
}

function resolveAccent(accentMap, key) {
    return accentMap[key] || key
}

function resolveStatus(dbalOnline, key) {
    if (key === "dbal")
        return dbalOnline ? "online" : "offline"
    return key
}

function loadFallbackData(root) {
    var data = loadJson(
        "config/frontpage-data.json")
    if (!data) return
    root.levels = data.levels.map(function(l) {
        l.accent = resolveAccent(
            root.accentMap, l.accentKey)
        return l
    })
    root.techStack = data.techStack.map(
        function(t) {
        t.accent = resolveAccent(
            root.accentMap, t.accentKey)
        return t
    })
    root.services = data.services.map(
        function(s) {
        s.status = resolveStatus(
            root.dbalOnline, s.statusKey)
        return s
    })
}

function refreshServiceStatuses(root) {
    if (root.services.length === 0) return
    var raw = loadJson(
        "config/frontpage-data.json")
    if (!raw) return
    root.services = raw.services.map(
        function(s) {
        s.status = resolveStatus(
            root.dbalOnline, s.statusKey)
        return s
    })
}

function onLevelClicked(modelData, appWindow) {
    var views = [
        "frontpage", "dashboard", "admin",
        "god-panel", "supergod"];
    appWindow.currentView =
        modelData.level <= appWindow.currentLevel
            ? views[modelData.level - 1] : "login";
}

function loadPlatformStatus(root, dbal) {
    dbal.ping(function(success) {
        if (success) {
            dbal.execute("core/version", {},
                function(r, e) {
                if (r && r.version)
                    root.platformVersion =
                        r.version
            })
            dbal.execute("core/stats", {},
                function(r, e) {
                if (r) root.publicStats = {
                    users: r.totalUsers
                        || root.publicStats
                            .users,
                    packages: r.totalPackages
                        || root.publicStats
                            .packages,
                    workflows: r.totalWorkflows
                        || root.publicStats
                            .workflows,
                    backends: r.totalBackends
                        || root.publicStats
                            .backends
                }
            })
        }
        refreshServiceStatuses(root)
    })
}
