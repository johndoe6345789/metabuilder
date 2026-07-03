import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ToolBar {
    id: root
    implicitHeight: 52
    signal settingsRequested()

    background: Rectangle {
        color: "#161b22"
        Rectangle {
            anchors {
                left: parent.left; right: parent.right
                bottom: parent.bottom
            }
            height: 1; color: "#30363d"
        }
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10

        Rectangle {
            width: 30; height: 30; radius: 7
            gradient: Gradient {
                orientation: Gradient.Horizontal
                GradientStop { position: 0.0; color: "#7c3aed" }
                GradientStop { position: 1.0; color: "#0ea5e9" }
            }
            Text {
                anchors.centerIn: parent
                text: "DJ"
                color: "white"
                font.pixelSize: 11
                font.bold: true
            }
        }

        Label {
            text: "DiscJockey"
            font.pixelSize: 17
            font.bold: true
            color: "#e6edf3"
        }

        Item { Layout.fillWidth: true }

        Button {
            text: "⚙  Settings"
            onClicked: root.settingsRequested()
            contentItem: Text {
                text: parent.text
                color: "#8b949e"
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                font.pixelSize: 13
            }
            background: Rectangle {
                color: parent.hovered
                    ? "#21262d" : "transparent"
                radius: 4
            }
        }
    }
}
