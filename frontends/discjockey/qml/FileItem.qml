import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    height: 52; radius: 4

    required property string filePath
    required property string fileName
    required property string fileExt
    required property string fileSizeStr
    required property bool   isSelected

    signal clicked(string path)
    signal removed()

    color: isSelected ? "#21262d" : "transparent"

    MouseArea {
        anchors.fill: parent
        onClicked: root.clicked(root.filePath)
    }

    RowLayout {
        anchors {
            left: parent.left; right: parent.right
            verticalCenter: parent.verticalCenter
            leftMargin: 8; rightMargin: 4
        }
        spacing: 6

        Rectangle {
            color: root.fileExt === "mp4"
                || root.fileExt === "mkv"
                || root.fileExt === "mov"
                ? "#7c3aed" : "#0ea5e9"
            radius: 3
            width: extL.width + 10; height: 20
            Label {
                id: extL
                text: root.fileExt.toUpperCase()
                color: "#e6edf3"; font.pixelSize: 10
                anchors.centerIn: parent
            }
        }

        ColumnLayout {
            Layout.fillWidth: true; spacing: 1
            Label {
                text: root.fileName; color: "#e6edf3"
                elide: Text.ElideMiddle
                Layout.fillWidth: true; font.pixelSize: 12
            }
            Label {
                text: root.fileSizeStr
                color: "#8b949e"; font.pixelSize: 11
            }
        }

        Button {
            implicitWidth: 24; implicitHeight: 24
            onClicked: root.removed()
            contentItem: Text {
                text: "✕"; color: "#8b949e"
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                font.pixelSize: 11
            }
            background: Rectangle {
                color: parent.hovered ? "#30363d" : "transparent"
                radius: 3
            }
        }
    }
}
