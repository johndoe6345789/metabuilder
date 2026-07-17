.pragma library

// DBAL persistence helpers for profile view.

function loadProfile(dbal, currentUser, callback) {
    if (!currentUser) return
    dbal.read("user", currentUser, function(result, error) {
        if (result) callback(result)
    })
}

function saveProfile(dbal, currentUser, data, callback) {
    dbal.update("user", currentUser, data, function(result, error) {
        callback(!!result, error)
    })
}

function changePassword(dbal, currentUser, passwords, callback) {
    if (passwords["new"] !== passwords["confirm"]) return
    dbal.execute("core/change-password", {
        userId: currentUser,
        oldPassword: passwords["current"],
        newPassword: passwords["new"]
    }, function(result, error) {
        callback(!!result, error)
    })
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    try {
        xhr.open("GET", relativePath, false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText)
    } catch(e) {}
    return null
}
