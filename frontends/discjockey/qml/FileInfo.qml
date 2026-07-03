import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: root
    spacing: 8

    required property string fileName
    required property string fileExt
    required property bool   isVideo

    Text {
        text: root.isVideo ? "🎬" : "▶"
        font.pixelSize: 48
        color: "#7c3aed"
        Layout.alignment: Qt.AlignHCenter
    }

    Label {
        text: root.fileName !== ""
            ? root.fileName
            : "No file selected"
        color: root.fileName !== ""
            ? "#e6edf3" : "#8b949e"
        font.pixelSize: 18
        font.bold: true
        Layout.alignment: Qt.AlignHCenter
        elide: Text.ElideMiddle
        Layout.fillWidth: true
        horizontalAlignment:
            Text.AlignHCenter
    }

    Label {
        visible: root.fileExt !== ""
        text: root.fileExt.toUpperCase()
            + (root.isVideo
                ? " · H.264 transcode"
                : " · MP3 transcode")
        color: "#8b949e"
        font.pixelSize: 13
        Layout.alignment: Qt.AlignHCenter
    }
}
