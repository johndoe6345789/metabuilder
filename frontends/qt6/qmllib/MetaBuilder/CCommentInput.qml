import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

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
        onTextChanged: root.commentText = text
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        Item { Layout.fillWidth: true }
        CButton {
            text: root.loading ? "Posting..." : "Post Comment"
            variant: "primary"
            size: "sm"
            enabled: root.commentText.trim().length > 0 && !root.loading
            onClicked: {
                root.submit(root.commentText.trim())
                root.commentText = ""
            }
        }
    }
}
