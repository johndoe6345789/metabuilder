import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    required property var user
    property bool isDark: false

    signal demote()

    Layout.fillWidth: true

    RowLayout {
        Layout.fillWidth: true
        spacing: 16

        CAvatar { initials: root.user.initials }

        ColumnLayout {
            spacing: 4
            Layout.fillWidth: true

            FlexRow {
                spacing: 8
                CText { variant: "subtitle1"; text: root.user.username }
                CBadge { text: "L" + root.user.level; badgeColor: Theme.primary }
                CBadge { text: root.user.role; badgeColor: Theme.secondary }
            }

            FlexRow {
                spacing: 8
                CText { variant: "caption"; text: "Tenant: " + root.user.tenant; color: Theme.textSecondary }
            }
        }

        CStatusBadge {
            status: root.user.status === "online" ? "success" : root.user.status === "away" ? "warning" : "error"
            text: root.user.status
        }

        CButton {
            text: "Manage"
            variant: "ghost"
            size: "sm"
            onClicked: root.demote()
        }
    }
}
