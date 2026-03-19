import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    Layout.fillWidth: true
    height: 40
    color: Theme.surface
    radius: 4

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 0

        CText {
            variant: "caption"
            text: "ORDER"
            Layout.preferredWidth: 60
        }
        CText {
            variant: "caption"
            text: "PATH"
            Layout.preferredWidth: 120
        }
        CText {
            variant: "caption"
            text: "TITLE"
            Layout.preferredWidth: 120
        }
        CText {
            variant: "caption"
            text: "LEVEL"
            Layout.preferredWidth: 60
        }
        CText {
            variant: "caption"
            text: "LAYOUT"
            Layout.preferredWidth: 100
        }
        CText {
            variant: "caption"
            text: "STATUS"
            Layout.fillWidth: true
        }
    }
}
