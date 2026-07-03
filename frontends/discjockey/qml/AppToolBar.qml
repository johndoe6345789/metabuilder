import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ToolBar {
    id: root

    property alias mediaHost: hostField.text
    property alias mediaPort: portField.text

    background: Rectangle { color: "#161b22" }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 8
        spacing: 12

        Label {
            text: "DiscJockey"
            font.pixelSize: 18
            font.bold: true
            color: "#7c3aed"
        }

        Item { Layout.fillWidth: true }

        Label {
            text: "Media Host:"
            color: "#8b949e"
        }

        TextField {
            id: hostField
            text: "localhost"
            implicitWidth: 120
            color: "#e6edf3"
            background: Rectangle {
                color: "#0f1117"
                border.color: "#30363d"
                radius: 4
            }
        }

        Label { text: ":"; color: "#8b949e" }

        TextField {
            id: portField
            text: "8090"
            implicitWidth: 60
            color: "#e6edf3"
            background: Rectangle {
                color: "#0f1117"
                border.color: "#30363d"
                radius: 4
            }
        }
    }
}
