import QtQuick 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: statusCard
    property string label: ""
    property string value: ""

    radius: 12
    color: "#0f1324"
    border.color: "#1f2b46"
    border.width: 1
    height: 60
    padding: 16

    RowLayout {
        anchors.fill: parent
        spacing: 12

        Text {
            text: statusCard.label
            color: "#d9e1ff"
            font.pixelSize: 17
            horizontalAlignment: Text.AlignLeft
        }

        Item { Layout.fillWidth: true }

        Text {
            text: statusCard.value
            font.pixelSize: 16
            color: statusCard.value === "healthy" ? "#39d98a" : "#facc15"
            horizontalAlignment: Text.AlignRight
        }
    }
}
