import QtQuick
import QtQuick.Layouts

Rectangle {
    id: root
    height: 52
    radius: 4

    required property string filePath
    required property string fileName
    required property string fileExt
    required property string fileSizeStr
    required property bool   isSelected

    signal clicked(string path)

    color: isSelected ? "#21262d" : "transparent"

    MouseArea {
        anchors.fill: parent
        onClicked: root.clicked(root.filePath)
    }

    ColumnLayout {
        anchors {
            left: parent.left
            right: parent.right
            verticalCenter: parent.verticalCenter
            margins: 8
        }
        spacing: 2

        RowLayout {
            Layout.fillWidth: true

            Label {
                text: root.fileName
                color: "#e6edf3"
                elide: Text.ElideMiddle
                Layout.fillWidth: true
                font.pixelSize: 12
            }

            Rectangle {
                color: "#7c3aed"
                radius: 3
                width: extLabel.width + 8
                height: 16

                Label {
                    id: extLabel
                    text: root.fileExt.toUpperCase()
                    color: "#e6edf3"
                    font.pixelSize: 10
                    anchors.centerIn: parent
                }
            }
        }

        Label {
            text: root.fileSizeStr
            color: "#8b949e"
            font.pixelSize: 11
        }
    }
}
