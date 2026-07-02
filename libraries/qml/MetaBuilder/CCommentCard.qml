import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "card_comment"
    Accessible.role: Accessible.Pane
    Accessible.name: root._c.username
        ? root._c.username + " comment"
        : "Comment"

    required property var comment
    property string currentUser: ""
    property bool isDark: false
    visible: root.comment != null

    readonly property var _c: root.comment || {
        username: "", initials: "", timestamp: "",
        body: "", likes: 0, liked: false, canDelete: false
    }

    signal liked()
    signal deleted()

    Layout.fillWidth: true

    // Comment header: avatar, user, time
    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        CAvatar {
            initials: root._c.initials
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2

            FlexRow {
                spacing: 8
                CText {
                    variant: "subtitle1"
                    text: root._c.username
                }
                CChip {
                    text: root._c.username === root.currentUser
                        ? "You" : ""
                    chipColor: Theme.primary
                    visible: root._c.username === root.currentUser
                }
            }

            CText {
                variant: "caption"
                text: root._c.timestamp
            }
        }
    }

    // Comment body
    CText {
        Layout.fillWidth: true
        variant: "body1"
        text: root._c.body
        wrapMode: Text.WordWrap
    }

    CDivider { Layout.fillWidth: true }

    // Actions row
    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        CButton {
            text: root._c.liked
                ? "Liked (" + root._c.likes + ")"
                : "Like (" + root._c.likes + ")"
            variant: root._c.liked ? "primary" : "ghost"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: root._c.liked
                ? "Unlike comment, "
                    + root._c.likes + " likes"
                : "Like comment, "
                    + root._c.likes + " likes"
            Keys.onReturnPressed: root.liked()
            Keys.onSpacePressed: root.liked()
            onClicked: root.liked()
        }

        Item { Layout.fillWidth: true }

        CButton {
            text: "Delete"
            variant: "danger"
            size: "sm"
            visible: root._c.canDelete || false
            activeFocusOnTab: visible
            Accessible.role: Accessible.Button
            Accessible.name: "Delete comment by "
                + (root._c.username || "user")
            Keys.onReturnPressed: root.deleted()
            Keys.onSpacePressed: root.deleted()
            onClicked: root.deleted()
        }
    }
}
