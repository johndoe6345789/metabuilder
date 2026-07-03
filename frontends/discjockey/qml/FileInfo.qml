import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: root
    spacing: 12

    required property string fileName
    required property string fileExt
    required property bool   isVideo

    // type icon — QML shapes avoid emoji font dependency
    Rectangle {
        Layout.alignment: Qt.AlignHCenter
        width: 56; height: 56; radius: 14
        color: root.isVideo
            ? Qt.rgba(0.49, 0.23, 0.93, 0.12)
            : Qt.rgba(0.05, 0.65, 0.91, 0.12)
        border.color: root.isVideo ? "#7c3aed" : "#0ea5e9"
        border.width: 2

        Text {
            anchors.centerIn: parent
            text: root.isVideo ? "▶" : "♪"
            color: root.isVideo ? "#7c3aed" : "#0ea5e9"
            font.pixelSize: 22
            font.bold: true
        }
    }

    Label {
        text: root.fileName !== "" ? root.fileName : "No file selected"
        color: root.fileName !== "" ? "#e6edf3" : "#8b949e"
        font.pixelSize: 17; font.bold: true
        Layout.alignment: Qt.AlignHCenter
        elide: Text.ElideMiddle
        Layout.fillWidth: true
        horizontalAlignment: Text.AlignHCenter
    }

    Label {
        visible: root.fileExt !== ""
        text: root.fileExt.toUpperCase()
            + (root.isVideo ? " · H.264 transcode" : " · MP3 transcode")
        color: "#8b949e"; font.pixelSize: 13
        Layout.alignment: Qt.AlignHCenter
    }
}
