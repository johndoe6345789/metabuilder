import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CProfileHeader - User profile header with large avatar, name,
 * role, level badge, and member-since caption.
 */
CCard {
    id: root
    Layout.fillWidth: true
    Layout.leftMargin: 24
    Layout.rightMargin: 24
    variant: "filled"

    property string username: ""
    property int level: 1
    property string role: ""
    property string email: ""
    property bool isDark: Theme.mode === "dark"
    property string memberSince: "January 15, 2026"

    readonly property color onSurfaceVariant: isDark
        ? Theme.textSecondary : Theme.textSecondary

    function userInitials() {
        var name = username
        if (!name || name.length === 0) return "??"
        var parts = name.split(" ")
        if (parts.length >= 2)
            return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.substring(0, 2).toUpperCase()
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 16

        CAvatar {
            initials: root.userInitials()
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 6

            CText {
                Layout.fillWidth: true
                variant: "h3"
                text: root.username
            }

            CText {
                Layout.fillWidth: true
                variant: "body2"
                text: root.email
                color: root.onSurfaceVariant
            }

            FlexRow {
                spacing: 8
                CBadge { text: root.role; badgeColor: Theme.primary }
                CBadge { text: "Level " + root.level; badgeColor: Theme.info }
            }

            CText {
                Layout.fillWidth: true
                variant: "caption"
                text: "Member since " + root.memberSince
                color: root.onSurfaceVariant
            }
        }
    }
}
