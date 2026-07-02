import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/UserManagementDBAL.js" as UDBAL

Rectangle {
    id: root
    color: Theme.background
    objectName: "view_user_management"
    Accessible.role: Accessible.Pane
    Accessible.name: "User Management"

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property var users: UDBAL.loadJson(
        Qt.resolvedUrl(
            "qmllib/MetaBuilder/data/"
            + "users-mock.json"
        )
    ) || []
    property string searchText: ""
    property string activeRoleFilter: "all"
    property int nextUid: 5
    property bool createDialogOpen: false
    property bool editDialogOpen: false
    property bool deleteDialogOpen: false
    property int editIndex: -1
    property int deleteIndex: -1
    readonly property var roles: [
        "user", "admin", "god", "supergod"
    ]

    function loadUsers() {
        UDBAL.loadUsers(dbal,
            function(parsed) {
                users = parsed || []
                nextUid = (parsed || []).length + 1
            }
        )
    }
    onUseLiveDataChanged: {
        if (useLiveData) loadUsers()
    }
    Component.onCompleted: { loadUsers() }

    function createUser(userData) {
        if (useLiveData) {
            dbal.create("user", userData,
                function(r, e) {
                    if (!e) loadUsers()
                    else {
                        users = UDBAL
                            .createUserLocally(
                                users, nextUid,
                                userData
                            )
                        nextUid++
                    }
                    createDialogOpen = false
                }
            )
        } else {
            users = UDBAL.createUserLocally(
                users, nextUid, userData
            )
            nextUid++
            createDialogOpen = false
        }
    }
    function saveEdit(userData) {
        if (editIndex < 0) return
        if (useLiveData) {
            dbal.update("user",
                users[editIndex].uid, userData,
                function(r, e) {
                    if (!e) loadUsers()
                    else users = UDBAL
                        .saveEditLocally(
                            users, editIndex,
                            userData
                        )
                    editDialogOpen = false
                }
            )
        } else {
            users = UDBAL.saveEditLocally(
                users, editIndex, userData
            )
            editDialogOpen = false
        }
    }
    function confirmDelete() {
        if (deleteIndex < 0) return
        if (useLiveData) {
            dbal.remove("user",
                users[deleteIndex].uid,
                function(r, e) {
                    if (!e) loadUsers()
                    else users = UDBAL
                        .deleteLocally(
                            users, deleteIndex
                        )
                    deleteDialogOpen = false
                    deleteIndex = -1
                }
            )
        } else {
            users = UDBAL.deleteLocally(
                users, deleteIndex
            )
            deleteDialogOpen = false
            deleteIndex = -1
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20; spacing: 16
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText {
                variant: "h3"
                text: "User Management"
            }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Create User"
                variant: "primary"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Create new user"
                Keys.onReturnPressed:
                    createDialogOpen = true
                onClicked: createDialogOpen = true
            }
        }
        UserStatsBar {
            Layout.fillWidth: true
            totalUsers: users.length
            adminCount: UDBAL.countByRole(
                users, "admin"
            )
            godCount: UDBAL.countByRole(
                users, "god"
            )
            superGodCount: UDBAL.countByRole(
                users, "supergod"
            )
        }
        UserSearchFilter {
            Layout.fillWidth: true
            searchText: root.searchText
            activeRoleFilter:
                root.activeRoleFilter
            onSearchChanged: function(t) {
                root.searchText = t
            }
            onRoleFilterChanged: function(r) {
                root.activeRoleFilter = r
            }
        }
        UserTable {
            Layout.fillWidth: true
            Layout.fillHeight: true
            users: UDBAL.filteredUsers(
                root.users, root.searchText,
                root.activeRoleFilter
            )
            allUsers: root.users
            onEditClicked: function(uid) {
                var idx = UDBAL.findUserIndex(
                    root.users, uid
                )
                if (idx < 0) return
                var u = root.users[idx]
                editFormDialog.formUsername =
                    u.username
                editFormDialog.formEmail =
                    u.email
                editFormDialog.formPassword = ""
                editFormDialog.formRole = u.role
                editFormDialog.formActive =
                    u.status === "active"
                editIndex = idx
                editDialogOpen = true
            }
            onDeleteClicked: function(uid) {
                deleteIndex = UDBAL.findUserIndex(
                    root.users, uid
                )
                deleteDialogOpen = true
            }
        }
    }

    UserFormDialog {
        visible: createDialogOpen
        isEdit: false; roles: root.roles
        onAccepted: createUser({
            username: formUsername,
            email: formEmail,
            role: formRole,
            status: formActive
                ? "active" : "inactive"
        })
        onCancelled: createDialogOpen = false
    }
    UserFormDialog {
        id: editFormDialog
        visible: editDialogOpen
        isEdit: true; roles: root.roles
        onAccepted: saveEdit({
            username: formUsername,
            email: formEmail,
            role: formRole,
            status: formActive
                ? "active" : "inactive"
        })
        onCancelled: editDialogOpen = false
    }

    CDialog {
        visible: deleteDialogOpen
        title: "Delete User"
        ColumnLayout {
            spacing: 16; width: 380
            CAlert {
                Layout.fillWidth: true
                severity: "error"
                text: deleteIndex >= 0
                    && deleteIndex < users.length
                    ? "Are you sure you want to"
                        + " delete \""
                        + users[deleteIndex]
                            .username
                        + "\"? This action cannot"
                        + " be undone."
                    : "Confirm deletion?"
            }
            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Cancel deletion"
                    Keys.onReturnPressed: {
                        deleteDialogOpen = false
                        deleteIndex = -1
                    }
                    onClicked: {
                        deleteDialogOpen = false
                        deleteIndex = -1
                    }
                }
                CButton {
                    text: "Delete"
                    variant: "danger"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name:
                        "Confirm delete user"
                    Keys.onReturnPressed:
                        confirmDelete()
                    onClicked: confirmDelete()
                }
            }
        }
    }
}
