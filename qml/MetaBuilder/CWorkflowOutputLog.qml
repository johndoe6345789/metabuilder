import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root

    property string output: ""

    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 6

    CText { variant: "caption"; text: "Output Log" }

    Rectangle {
        Layout.fillWidth: true
        Layout.fillHeight: true
        color: Theme.surface
        radius: 4
        border.color: Theme.border
        border.width: 1

        ScrollView {
            anchors.fill: parent
            anchors.margins: 8

            Text {
                width: parent.width
                text: root.output
                color: Theme.text
                font.family: "monospace"
                font.pixelSize: 11
                wrapMode: Text.WrapAnywhere
            }
        }
    }
}
