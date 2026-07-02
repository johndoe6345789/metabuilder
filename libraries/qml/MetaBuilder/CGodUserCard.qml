import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "card_god_user"
    Accessible.role: Accessible.ListItem
    Accessible.name: user ? user.username : ""

    required property var user
    property bool isDark: false
    visible: root.user != null

    readonly property var _u: root.user || {
        username: "", initials: "", level: 0,
        role: "", tenant: "", status: ""
    }

    signal demote()

    Layout.fillWidth: true

    RowLayout {
        Layout.fillWidth: true
        spacing: 16

        CAvatar { initials: root._u.initials }

        ColumnLayout {
            spacing: 4
            Layout.fillWidth: true

            FlexRow {
                spacing: 8
                CText { variant: "subtitle1"; text: root._u.username }
                CBadge { text: "L" + root._u.level
                badgeColor: Theme.primary }
                CBadge { text: root._u.role; badgeColor: Theme.secondary }
            }

            FlexRow {
                spacing: 8
                CText { variant: "caption"; text: "Tenant: " + root._u.tenant
                color: Theme.textSecondary }
            }
        }

        CStatusBadge {
            status: root._u.status === "online"
                ? "success" : root._u.status === "away" ? "warning" : "error"
            text: root._u.status
        }

        CButton {
            text: "Manage"
            variant: "ghost"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Manage " + root._u.username
            Accessible.description:
                "Open management options for "
                + root._u.username
            Keys.onReturnPressed: root.demote()
            Keys.onSpacePressed: root.demote()
            onClicked: root.demote()
        }
    }
}
