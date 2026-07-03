import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "transparent"

    signal mediaHostChanged(string host)
    signal mediaPortChanged(int port)
    signal s3HostChanged(string host)
    signal s3PortChanged(int port)

    ColumnLayout {
        anchors.fill: parent
        spacing: 6

        Label {
            text: "Server Configuration"
            color: "#8b949e"
            font.pixelSize: 12
            font.bold: true
        }

        ServerConfigGrid {
            Layout.fillWidth: true
            onMediaHostChanged: h =>
                root.mediaHostChanged(h)
            onMediaPortChanged: p =>
                root.mediaPortChanged(p)
            onS3HostChanged: h =>
                root.s3HostChanged(h)
            onS3PortChanged: p =>
                root.s3PortChanged(p)
        }
    }
}
