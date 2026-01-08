import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: navBar
    property alias title: titleText.text
    property var actions: ["Home", "Docs", "Login"]
    signal actionTriggered(string action)

    height: 64
    width: parent ? parent.width : 1280
    color: "#050613"
    border.color: "#1e2b4a"

    RowLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 24

        Text {
            id: titleText
            text: "MetaBuilder"
            color: "#f8fbff"
            font.pixelSize: 20
            font.bold: true
        }

        Item { Layout.fillWidth: true }

        Repeater {
            model: actions
            delegate: Button {
                text: modelData
                font.pixelSize: 14
                onClicked: navBar.actionTriggered(modelData)
            }
        }
    }
}
