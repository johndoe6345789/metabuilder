import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    // ── Local state ──────────────────────────────────────────────────
    property var users: [
        { uid: 1, username: "demo",  email: "demo@metabuilder.dev",  role: "user",     level: 2, status: "active",   created: "2025-11-02" },
        { uid: 2, username: "admin", email: "admin@metabuilder.dev", role: "admin",    level: 3, status: "active",   created: "2025-09-14" },
        { uid: 3, username: "god",   email: "god@metabuilder.dev",   role: "god",      level: 4, status: "active",   created: "2025-06-01" },
        { uid: 4, username: "super", email: "super@metabuilder.dev", role: "supergod", level: 5, status: "inactive", created: "2025-03-22" }
    ]

    property string searchText: ""
    property string activeRoleFilter: "all"
    property int nextUid: 5

    property bool createDialogOpen: false
    property bool editDialogOpen: false
    property bool deleteDialogOpen: false
    property int editIndex: -1
    property int deleteIndex: -1

    readonly property var roles: ["user", "admin", "god", "supergod"]

    // ── DBAL Integration ─────────────────────────────────────────────
    function loadUsers() {
        dbal.list("user", { take: 50 }, function(result, error) {
            if (!error && result && result.items && result.items.length > 0) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var u = result.items[i]
                    parsed.push({ uid: u.id || u.uid || (i + 1), username: u.username || "", email: u.email || "", role: u.role || "user", level: levelForRole(u.role || "user"), status: u.status || "active", created: u.createdAt ? u.createdAt.slice(0, 10) : (u.created || "") })
                }
                users = parsed; nextUid = parsed.length + 1
            }
        })
    }
    onUseLiveDataChanged: { if (useLiveData) loadUsers() }
    Component.onCompleted: { loadUsers() }

    // ── Helpers ──────────────────────────────────────────────────────
    function levelForRole(role) {
        if (role === "user") return 2; if (role === "admin") return 3
        if (role === "god") return 4; if (role === "supergod") return 5; return 1
    }

    function countByRole(role) { return users.filter(function(u) { return u.role === role }).length }

    function filteredUsers() {
        var q = searchText.toLowerCase()
        return users.filter(function(u) {
            var matchesRole = activeRoleFilter === "all" || u.role === activeRoleFilter
            var matchesSearch = q === "" || u.username.toLowerCase().indexOf(q) !== -1 || u.email.toLowerCase().indexOf(q) !== -1 || u.role.toLowerCase().indexOf(q) !== -1
            return matchesRole && matchesSearch
        })
    }

    function findUserIndex(uid) {
        for (var i = 0; i < users.length; i++) { if (users[i].uid === uid) return i }
        return -1
    }

    function createUser(userData) {
        if (useLiveData) {
            dbal.create("user", userData, function(result, error) {
                if (!error) loadUsers(); else createUserLocally(userData)
                createDialogOpen = false
            })
        } else { createUserLocally(userData); createDialogOpen = false }
    }

    function createUserLocally(userData) {
        var copy = users.slice()
        copy.push({ uid: nextUid, username: userData.username, email: userData.email, role: userData.role, level: levelForRole(userData.role), status: userData.status, created: new Date().toISOString().slice(0, 10) })
        users = copy; nextUid++
    }

    function saveEdit(userData) {
        if (editIndex < 0) return
        if (useLiveData) {
            dbal.update("user", users[editIndex].uid, userData, function(result, error) {
                if (!error) loadUsers(); else saveEditLocally(userData)
                editDialogOpen = false
            })
        } else { saveEditLocally(userData); editDialogOpen = false }
    }

    function saveEditLocally(userData) {
        var copy = users.slice()
        copy[editIndex] = Object.assign({}, copy[editIndex], { username: userData.username, email: userData.email, role: userData.role, level: levelForRole(userData.role), status: userData.status })
        users = copy
    }

    function confirmDelete() {
        if (deleteIndex < 0) return
        if (useLiveData) {
            dbal.remove("user", users[deleteIndex].uid, function(result, error) {
                if (!error) loadUsers(); else { var c = users.slice(); c.splice(deleteIndex, 1); users = c }
                deleteDialogOpen = false; deleteIndex = -1
            })
        } else {
            var c = users.slice(); c.splice(deleteIndex, 1); users = c
            deleteDialogOpen = false; deleteIndex = -1
        }
    }

    // ── Main layout ──────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "User Management" }
            Item { Layout.fillWidth: true }
            CButton { text: "Create User"; variant: "primary"; onClicked: createDialogOpen = true }
        }

        UserStatsBar {
            Layout.fillWidth: true
            totalUsers: users.length
            adminCount: countByRole("admin")
            godCount: countByRole("god")
            superGodCount: countByRole("supergod")
        }

        UserSearchFilter {
            Layout.fillWidth: true
            searchText: root.searchText
            activeRoleFilter: root.activeRoleFilter
            onSearchChanged: function(text) { root.searchText = text }
            onRoleFilterChanged: function(role) { root.activeRoleFilter = role }
        }

        UserTable {
            Layout.fillWidth: true
            Layout.fillHeight: true
            users: filteredUsers()
            allUsers: root.users
            onEditClicked: function(uid) {
                var idx = findUserIndex(uid); if (idx < 0) return
                var u = users[idx]
                editFormDialog.formUsername = u.username; editFormDialog.formEmail = u.email
                editFormDialog.formPassword = ""; editFormDialog.formRole = u.role
                editFormDialog.formActive = u.status === "active"
                editIndex = idx; editDialogOpen = true
            }
            onDeleteClicked: function(uid) {
                deleteIndex = findUserIndex(uid); deleteDialogOpen = true
            }
        }
    }

    // ── Create User Dialog ───────────────────────────────────────────
    UserFormDialog {
        visible: createDialogOpen
        isEdit: false
        roles: root.roles
        onAccepted: createUser({ username: formUsername, email: formEmail, role: formRole, status: formActive ? "active" : "inactive" })
        onCancelled: createDialogOpen = false
    }

    // ── Edit User Dialog ─────────────────────────────────────────────
    UserFormDialog {
        id: editFormDialog
        visible: editDialogOpen
        isEdit: true
        roles: root.roles
        onAccepted: saveEdit({ username: formUsername, email: formEmail, role: formRole, status: formActive ? "active" : "inactive" })
        onCancelled: editDialogOpen = false
    }

    // ── Delete Confirmation Dialog ───────────────────────────────────
    CDialog {
        visible: deleteDialogOpen; title: "Delete User"
        ColumnLayout {
            spacing: 16; width: 380
            CAlert {
                Layout.fillWidth: true; severity: "error"
                text: deleteIndex >= 0 && deleteIndex < users.length
                    ? "Are you sure you want to delete \"" + users[deleteIndex].username + "\"? This action cannot be undone."
                    : "Confirm deletion?"
            }
            FlexRow {
                Layout.fillWidth: true; spacing: 8; Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; onClicked: { deleteDialogOpen = false; deleteIndex = -1 } }
                CButton { text: "Delete"; variant: "danger"; onClicked: confirmDelete() }
            }
        }
    }
}
