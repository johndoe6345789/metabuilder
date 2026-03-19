import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: Theme.background

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

    // Dialog state
    property bool createDialogOpen: false
    property bool editDialogOpen: false
    property bool deleteDialogOpen: false
    property int editIndex: -1
    property int deleteIndex: -1

    // Form fields
    property string formUsername: ""
    property string formEmail: ""
    property string formPassword: ""
    property string formRole: "user"
    property bool formActive: true

    readonly property var roles: ["user", "admin", "god", "supergod"]

    // ── Helpers ──────────────────────────────────────────────────────
    function initials(name) {
        var parts = name.split("")
        return (parts[0] || "").toUpperCase() + (parts[1] || "").toUpperCase()
    }

    function roleColor(role) {
        if (role === "supergod") return "#e040fb"
        if (role === "god")      return "#ff9800"
        if (role === "admin")    return "#2196f3"
        return "#4caf50"
    }

    function statusString(s) { return s === "active" ? "success" : "warning" }

    function countByRole(role) {
        return users.filter(function(u) { return u.role === role }).length
    }

    function filteredUsers() {
        var q = searchText.toLowerCase()
        return users.filter(function(u) {
            var matchesRole = activeRoleFilter === "all" || u.role === activeRoleFilter
            var matchesSearch = q === "" ||
                u.username.toLowerCase().indexOf(q) !== -1 ||
                u.email.toLowerCase().indexOf(q) !== -1 ||
                u.role.toLowerCase().indexOf(q) !== -1
            return matchesRole && matchesSearch
        })
    }

    function clearForm() {
        formUsername = ""
        formEmail    = ""
        formPassword = ""
        formRole     = "user"
        formActive   = true
    }

    function openCreateDialog() {
        clearForm()
        createDialogOpen = true
    }

    function openEditDialog(idx) {
        var u = users[idx]
        formUsername = u.username
        formEmail   = u.email
        formPassword = ""
        formRole    = u.role
        formActive  = u.status === "active"
        editIndex   = idx
        editDialogOpen = true
    }

    function openDeleteDialog(idx) {
        deleteIndex = idx
        deleteDialogOpen = true
    }

    function levelForRole(role) {
        if (role === "user")     return 2
        if (role === "admin")    return 3
        if (role === "god")      return 4
        if (role === "supergod") return 5
        return 1
    }

    function createUser() {
        if (formUsername === "" || formEmail === "") return
        var newUser = {
            uid: nextUid,
            username: formUsername,
            email: formEmail,
            role: formRole,
            level: levelForRole(formRole),
            status: formActive ? "active" : "inactive",
            created: new Date().toISOString().slice(0, 10)
        }
        var copy = users.slice()
        copy.push(newUser)
        users = copy
        nextUid++
        createDialogOpen = false
        clearForm()
    }

    function saveEdit() {
        if (editIndex < 0) return
        var copy = users.slice()
        copy[editIndex] = Object.assign({}, copy[editIndex], {
            username: formUsername,
            email: formEmail,
            role: formRole,
            level: levelForRole(formRole),
            status: formActive ? "active" : "inactive"
        })
        users = copy
        editDialogOpen = false
        clearForm()
    }

    function confirmDelete() {
        if (deleteIndex < 0) return
        var copy = users.slice()
        copy.splice(deleteIndex, 1)
        users = copy
        deleteDialogOpen = false
        deleteIndex = -1
    }

    // ── Main layout ──────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // Header
        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h3"; text: "User Management" }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Create User"
                variant: "primary"
                onClicked: openCreateDialog()
            }
        }

        // ── Stats bar ────────────────────────────────────────────────
        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CCard {
                Layout.fillWidth: true
                implicitHeight: statCol1.implicitHeight + 32

                ColumnLayout {
                    id: statCol1
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 4
                    CText { variant: "caption"; text: "Total Users" }
                    CText { variant: "h4"; text: String(users.length) }
                }
            }

            CCard {
                Layout.fillWidth: true
                implicitHeight: statCol2.implicitHeight + 32

                ColumnLayout {
                    id: statCol2
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 4
                    CText { variant: "caption"; text: "Admins" }
                    CText { variant: "h4"; text: String(countByRole("admin")) }
                }
            }

            CCard {
                Layout.fillWidth: true
                implicitHeight: statCol3.implicitHeight + 32

                ColumnLayout {
                    id: statCol3
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 4
                    CText { variant: "caption"; text: "Gods" }
                    CText { variant: "h4"; text: String(countByRole("god")) }
                }
            }

            CCard {
                Layout.fillWidth: true
                implicitHeight: statCol4.implicitHeight + 32

                ColumnLayout {
                    id: statCol4
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 4
                    CText { variant: "caption"; text: "SuperGods" }
                    CText { variant: "h4"; text: String(countByRole("supergod")) }
                }
            }
        }

        // ── Search & filter ──────────────────────────────────────────
        CCard {
            Layout.fillWidth: true
            implicitHeight: filterCol.implicitHeight + 32

            ColumnLayout {
                id: filterCol
                anchors.fill: parent
                anchors.margins: 16
                spacing: 12

                CTextField {
                    Layout.fillWidth: true
                    label: "Search"
                    placeholderText: "Filter by username, email, or role..."
                    text: searchText
                    onTextChanged: searchText = text
                }

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CChip {
                        text: "All"
                        selected: activeRoleFilter === "all"
                        onClicked: activeRoleFilter = "all"
                    }
                    CChip {
                        text: "User"
                        selected: activeRoleFilter === "user"
                        onClicked: activeRoleFilter = "user"
                    }
                    CChip {
                        text: "Admin"
                        selected: activeRoleFilter === "admin"
                        onClicked: activeRoleFilter = "admin"
                    }
                    CChip {
                        text: "God"
                        selected: activeRoleFilter === "god"
                        onClicked: activeRoleFilter = "god"
                    }
                    CChip {
                        text: "SuperGod"
                        selected: activeRoleFilter === "supergod"
                        onClicked: activeRoleFilter = "supergod"
                    }
                }
            }
        }

        // ── User table ──────────────────────────────────────────────
        CCard {
            Layout.fillWidth: true
            Layout.fillHeight: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 0

                // Table header
                Rectangle {
                    Layout.fillWidth: true
                    height: 40
                    color: Theme.surface
                    radius: 4

                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 12
                        anchors.rightMargin: 12
                        spacing: 8

                        CText { variant: "caption"; text: "AVATAR";   Layout.preferredWidth: 56 }
                        CText { variant: "caption"; text: "USERNAME"; Layout.preferredWidth: 120 }
                        CText { variant: "caption"; text: "EMAIL";    Layout.fillWidth: true }
                        CText { variant: "caption"; text: "ROLE";     Layout.preferredWidth: 100 }
                        CText { variant: "caption"; text: "LEVEL";    Layout.preferredWidth: 50 }
                        CText { variant: "caption"; text: "STATUS";   Layout.preferredWidth: 90 }
                        CText { variant: "caption"; text: "CREATED";  Layout.preferredWidth: 100 }
                        CText { variant: "caption"; text: "ACTIONS";  Layout.preferredWidth: 140 }
                    }
                }

                CDivider { Layout.fillWidth: true }

                // Table body
                ListView {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    model: filteredUsers()
                    clip: true
                    spacing: 0

                    delegate: Rectangle {
                        width: parent ? parent.width : 600
                        height: 56
                        color: index % 2 === 0 ? "transparent" : Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.3)

                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12
                            anchors.rightMargin: 12
                            spacing: 8

                            // Avatar
                            Item {
                                Layout.preferredWidth: 56
                                Layout.preferredHeight: 40

                                CAvatar {
                                    anchors.centerIn: parent
                                    initials: modelData.username.substring(0, 2).toUpperCase()
                                }
                            }

                            // Username
                            CText {
                                variant: "body1"
                                text: modelData.username
                                Layout.preferredWidth: 120
                                elide: Text.ElideRight
                            }

                            // Email
                            CText {
                                variant: "body2"
                                text: modelData.email
                                Layout.fillWidth: true
                                elide: Text.ElideRight
                            }

                            // Role badge
                            Item {
                                Layout.preferredWidth: 100
                                Layout.preferredHeight: 40

                                CBadge {
                                    anchors.verticalCenter: parent.verticalCenter
                                    text: modelData.role
                                    color: roleColor(modelData.role)
                                }
                            }

                            // Level
                            CText {
                                variant: "body2"
                                text: "L" + modelData.level
                                Layout.preferredWidth: 50
                            }

                            // Status
                            Item {
                                Layout.preferredWidth: 90
                                Layout.preferredHeight: 40

                                CStatusBadge {
                                    anchors.verticalCenter: parent.verticalCenter
                                    status: statusString(modelData.status)
                                    text: modelData.status
                                }
                            }

                            // Created
                            CText {
                                variant: "caption"
                                text: modelData.created
                                Layout.preferredWidth: 100
                            }

                            // Actions
                            FlexRow {
                                Layout.preferredWidth: 140
                                spacing: 6

                                CButton {
                                    text: "Edit"
                                    variant: "ghost"
                                    size: "sm"
                                    onClicked: {
                                        // Find the real index in the users array
                                        for (var i = 0; i < users.length; i++) {
                                            if (users[i].uid === modelData.uid) {
                                                openEditDialog(i)
                                                break
                                            }
                                        }
                                    }
                                }
                                CButton {
                                    text: "Delete"
                                    variant: "danger"
                                    size: "sm"
                                    onClicked: {
                                        for (var i = 0; i < users.length; i++) {
                                            if (users[i].uid === modelData.uid) {
                                                openDeleteDialog(i)
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Empty state
                CText {
                    visible: filteredUsers().length === 0
                    Layout.fillWidth: true
                    Layout.topMargin: 24
                    variant: "body2"
                    text: "No users match the current filter."
                    horizontalAlignment: Text.AlignHCenter
                }
            }
        }
    }

    // ── Create User Dialog ───────────────────────────────────────────
    CDialog {
        id: createDialog
        visible: createDialogOpen
        title: "Create User"

        ColumnLayout {
            spacing: 14
            width: 380

            CTextField {
                Layout.fillWidth: true
                label: "Username"
                placeholderText: "Enter username"
                text: formUsername
                onTextChanged: formUsername = text
            }

            CTextField {
                Layout.fillWidth: true
                label: "Email"
                placeholderText: "Enter email address"
                text: formEmail
                onTextChanged: formEmail = text
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4

                CTextField {
                    Layout.fillWidth: true
                    label: "Password"
                    placeholderText: "Enter password"
                    text: formPassword
                    echoMode: TextInput.Password
                    onTextChanged: formPassword = text
                }

                CBadge { text: "SHA-512 hashed"; color: "#607d8b" }
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 6
                CText { variant: "caption"; text: "Role" }

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 6

                    Repeater {
                        model: roles
                        CChip {
                            text: modelData
                            selected: formRole === modelData
                            onClicked: formRole = modelData
                        }
                    }
                }
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                CText { variant: "body2"; text: "Active" }
                CSwitch {
                    checked: formActive
                    onCheckedChanged: formActive = checked
                }
            }

            CDivider { Layout.fillWidth: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: { createDialogOpen = false; clearForm() }
                }
                CButton {
                    text: "Create"
                    variant: "primary"
                    enabled: formUsername !== "" && formEmail !== "" && formPassword !== ""
                    onClicked: createUser()
                }
            }
        }
    }

    // ── Edit User Dialog ─────────────────────────────────────────────
    CDialog {
        id: editDialog
        visible: editDialogOpen
        title: "Edit User"

        ColumnLayout {
            spacing: 14
            width: 380

            CTextField {
                Layout.fillWidth: true
                label: "Username"
                placeholderText: "Enter username"
                text: formUsername
                onTextChanged: formUsername = text
            }

            CTextField {
                Layout.fillWidth: true
                label: "Email"
                placeholderText: "Enter email address"
                text: formEmail
                onTextChanged: formEmail = text
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4

                CTextField {
                    Layout.fillWidth: true
                    label: "Password"
                    placeholderText: "Leave blank to keep current"
                    text: formPassword
                    echoMode: TextInput.Password
                    onTextChanged: formPassword = text
                }

                CBadge { text: "SHA-512 hashed"; color: "#607d8b" }
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 6
                CText { variant: "caption"; text: "Role" }

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 6

                    Repeater {
                        model: roles
                        CChip {
                            text: modelData
                            selected: formRole === modelData
                            onClicked: formRole = modelData
                        }
                    }
                }
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                CText { variant: "body2"; text: "Active" }
                CSwitch {
                    checked: formActive
                    onCheckedChanged: formActive = checked
                }
            }

            CDivider { Layout.fillWidth: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: { editDialogOpen = false; clearForm() }
                }
                CButton {
                    text: "Save Changes"
                    variant: "primary"
                    enabled: formUsername !== "" && formEmail !== ""
                    onClicked: saveEdit()
                }
            }
        }
    }

    // ── Delete Confirmation Dialog ───────────────────────────────────
    CDialog {
        id: deleteDialog
        visible: deleteDialogOpen
        title: "Delete User"

        ColumnLayout {
            spacing: 16
            width: 380

            CAlert {
                Layout.fillWidth: true
                severity: "error"
                text: deleteIndex >= 0 && deleteIndex < users.length
                    ? "Are you sure you want to delete \"" + users[deleteIndex].username + "\"? This action cannot be undone."
                    : "Confirm deletion?"
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: { deleteDialogOpen = false; deleteIndex = -1 }
                }
                CButton {
                    text: "Delete"
                    variant: "danger"
                    onClicked: confirmDelete()
                }
            }
        }
    }
}
