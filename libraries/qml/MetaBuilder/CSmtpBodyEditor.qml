import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root

    property string body: ""
    signal bodyEdited(string value)

    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 4

    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        CText { variant: "caption"; text: "Body Template" }
        Item { Layout.fillWidth: true }
        CText {
            variant: "caption"
            text: "Supports {{variable}} placeholders"
        }
    }

    Rectangle {
        Layout.fillWidth: true
        Layout.fillHeight: true
        Layout.minimumHeight: 180
        color: Theme.surface
        border.color: Theme.border
        border.width: 1
        radius: 4

        ScrollView {
            anchors.fill: parent
            anchors.margins: 8

            TextArea {
                text: root.body
                wrapMode: Text.Wrap
                color: Theme.text
                font.pixelSize: 13
                font.family: "monospace"
                background: null
                onTextChanged: root.bodyEdited(text)
            }
        }
    }
}
