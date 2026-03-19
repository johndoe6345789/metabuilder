import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "card_comment_input"
    Accessible.role: Accessible.Pane
    Accessible.name: "Post a Comment"
    activeFocusOnTab: true

    property bool isDark: false
    property bool loading: false
    property string commentText: ""

    signal submit(string text)

    Layout.fillWidth: true

    CText { variant: "subtitle1"; text: "Post a Comment" }

    CTextField {
        Layout.fillWidth: true
        label: "Your comment"
        placeholderText: "Write your thoughts..."
        text: root.commentText
        activeFocusOnTab: true
        Accessible.role: Accessible.EditableText
        Accessible.name: "Your comment"
        Accessible.description:
            "Type your comment here"
        onTextChanged: root.commentText = text
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        Item { Layout.fillWidth: true }
        CButton {
            text: root.loading
                ? "Posting..." : "Post Comment"
            variant: "primary"
            size: "sm"
            enabled: root.commentText.trim().length > 0
                && !root.loading
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: root.loading
                ? "Posting comment"
                : "Post Comment"
            Keys.onReturnPressed: {
                if (enabled) {
                    root.submit(
                        root.commentText.trim())
                    root.commentText = ""
                }
            }
            Keys.onSpacePressed: {
                if (enabled) {
                    root.submit(
                        root.commentText.trim())
                    root.commentText = ""
                }
            }
            onClicked: {
                root.submit(root.commentText.trim())
                root.commentText = ""
            }
        }
    }
}
