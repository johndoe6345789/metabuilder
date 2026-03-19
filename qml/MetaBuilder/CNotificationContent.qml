import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    Layout.fillWidth: true
    spacing: 4

    property string title: ""
    property string message: ""
    property string type: ""
    property string timestamp: ""
    property bool isRead: true

    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        CText {
            variant: root.isRead ? "body1" : "subtitle1"
            text: root.title
            font.bold: !root.isRead
        }

        CBadge { text: root.type }

        Item { Layout.fillWidth: true }

        CText {
            variant: "caption"
            text: root.timestamp
            opacity: 0.6
        }
    }

    CText {
        Layout.fillWidth: true
        variant: "body2"
        text: root.message
        opacity: root.isRead ? 0.6 : 0.85
        wrapMode: Text.WordWrap
    }
}
