import QtQuick
import QtQuick.Layouts

Rectangle {
    id: card
    objectName: "featureCard"
    Accessible.role: Accessible.Pane
    Accessible.name: title
    property string title: ""
    property string description: ""

    radius: 10
    color: "#11152b"
    border.color: "#1f2b45"
    border.width: 1
    padding: 14

    ColumnLayout {
        anchors.fill: parent
        spacing: 6

        Text {
            text: card.title
            font.pixelSize: 16
            color: "#f5f8ff"
            wrapMode: Text.Wrap
        }

        Text {
            text: card.description
            font.pixelSize: 13
            color: "#aeb8cf"
            wrapMode: Text.Wrap
        }
    }
}
