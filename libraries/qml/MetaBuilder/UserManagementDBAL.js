.pragma library

// DBAL persistence and local CRUD helpers
// for user management.

function levelForRole(role) {
    if (role === "user") return 2
    if (role === "admin") return 3
    if (role === "god") return 4
    if (role === "supergod") return 5
    return 1
}

function countByRole(users, role) {
    return (users || []).filter(
        function(u) { return u.role === role }
    ).length
}

function filteredUsers(users, searchText,
                      activeRoleFilter) {
    var q = searchText.toLowerCase()
    return (users || []).filter(function(u) {
        var matchesRole =
            activeRoleFilter === "all"
            || u.role === activeRoleFilter
        var matchesSearch = q === ""
            || u.username.toLowerCase()
                .indexOf(q) !== -1
            || u.email.toLowerCase()
                .indexOf(q) !== -1
            || u.role.toLowerCase()
                .indexOf(q) !== -1
        return matchesRole && matchesSearch
    })
}

function findUserIndex(users, uid) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].uid === uid) return i
    }
    return -1
}

function loadUsers(dbal, callback) {
    dbal.list("user", { take: 50 },
        function(result, error) {
        if (!error && result && result.items
            && result.items.length > 0) {
            var parsed = []
            for (var i = 0;
                 i < result.items.length; i++) {
                var u = result.items[i]
                parsed.push({
                    uid: u.id || u.uid
                        || (i + 1),
                    username: u.username || "",
                    email: u.email || "",
                    role: u.role || "user",
                    level: levelForRole(
                        u.role || "user"),
                    status: u.status || "active",
                    created: u.createdAt
                        ? u.createdAt.slice(0, 10)
                        : (u.created || "")
                })
            }
            callback(parsed)
        }
    })
}

function createUserLocally(users, nextUid,
                           userData) {
    var copy = users.slice()
    copy.push({
        uid: nextUid,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        level: levelForRole(userData.role),
        status: userData.status,
        created: new Date().toISOString()
            .slice(0, 10)
    })
    return copy
}

function saveEditLocally(users, editIndex,
                         userData) {
    var copy = users.slice()
    copy[editIndex] = Object.assign(
        {}, copy[editIndex], {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        level: levelForRole(userData.role),
        status: userData.status
    })
    return copy
}

function deleteLocally(users, deleteIndex) {
    var c = users.slice()
    c.splice(deleteIndex, 1)
    return c
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", relativePath, false)
    xhr.send()
    if (xhr.status === 200 || xhr.status === 0)
        try { return JSON.parse(xhr.responseText) }
        catch(e) { return [] }
    return []
}
