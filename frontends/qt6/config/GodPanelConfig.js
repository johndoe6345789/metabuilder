.pragma library

// Synchronous JSON loader for Qt resource files
function loadJson(path) {
    var xhr = new XMLHttpRequest()
    try {
        xhr.open("GET", path, false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText)
    } catch(e) {}
    return []
}

function loadTabs() {
    return loadJson("qrc:/qt/qml/DBALObservatory/config/god-panel-tabs.json")
}

function loadLevels() {
    return loadJson("qrc:/qt/qml/DBALObservatory/config/god-panel-levels.json")
}

function loadConfigStats() {
    return loadJson("qrc:/qt/qml/DBALObservatory/config/god-panel-config-stats.json")
}

// Map accent name strings to actual color values
function resolveAccentColor(name, palette) {
    var map = {
        "blue": palette.accentBlue,
        "cyan": palette.accentCyan,
        "violet": palette.accentViolet,
        "amber": palette.accentAmber,
        "rose": palette.accentRose
    }
    return map[name] || palette.accentBlue
}

// Build resolved config stat data from JSON + live counts + palette
function resolveConfigStats(rawStats, configCounts, palette) {
    var result = []
    for (var i = 0; i < rawStats.length; i++) {
        var s = rawStats[i]
        var val = configCounts[s.valueKey]
        result.push({
            label: s.label,
            value: (val !== undefined ? val : 0).toString(),
            accent: resolveAccentColor(s.accentName, palette)
        })
    }
    return result
}
