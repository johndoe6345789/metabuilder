import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "card_comment"
    Accessible.role: Accessible.Pane
    Accessible.name: comment.username
        ? comment.username + " comment"
        : "Comment"

    required property var comment
    property string currentUser: ""
    property bool isDark: false

    signal liked()
    signal deleted()

    Layout.fillWidth: true

    // Comment header: avatar, user, time
    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        CAvatar {
            initials: root.comment.initials
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2

            FlexRow {
                spacing: 8
                CText {
                    variant: "subtitle1"
                    text: root.comment.username
                }
                CChip {
                    text: root.comment.username === root.currentUser
                        ? "You" : ""
                    chipColor: Theme.primary
                    visible: root.comment.username === root.currentUser
                }
            }

            CText {
                variant: "caption"
                text: root.comment.timestamp
            }
        }
    }

    // Comment body
    CText {
        Layout.fillWidth: true
        variant: "body1"
        text: root.comment.body
        wrapMode: Text.WordWrap
    }

    CDivider { Layout.fillWidth: true }

    // Actions row
    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        CButton {
            text: root.comment.liked
                ? "Liked (" + root.comment.likes + ")"
                : "Like (" + root.comment.likes + ")"
            variant: root.comment.liked ? "primary" : "ghost"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: root.comment.liked
                ? "Unlike comment, "
                    + root.comment.likes + " likes"
                : "Like comment, "
                    + root.comment.likes + " likes"
            Keys.onReturnPressed: root.liked()
            Keys.onSpacePressed: root.liked()
            onClicked: root.liked()
        }

        Item { Layout.fillWidth: true }

        CButton {
            text: "Delete"
            variant: "danger"
            size: "sm"
            visible: root.comment.canDelete || false
            activeFocusOnTab: visible
            Accessible.role: Accessible.Button
            Accessible.name: "Delete comment by "
                + (root.comment.username || "user")
            Keys.onReturnPressed: root.deleted()
            Keys.onSpacePressed: root.deleted()
            onClicked: root.deleted()
        }
    }
}
