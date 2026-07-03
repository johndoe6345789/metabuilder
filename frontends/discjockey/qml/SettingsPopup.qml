import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Popup {
    id: root
    width: 380; height: 180
    padding: 16
    modal: false; focus: true
    closePolicy: Popup.CloseOnEscape
        | Popup.CloseOnPressOutside

    signal mediaHostChanged(string h)
    signal mediaPortChanged(int p)
    signal s3HostChanged(string h)
    signal s3PortChanged(int p)

    background: Rectangle {
        color: "#161b22"; radius: 8
        border.color: "#30363d"; border.width: 1
    }

    ColumnLayout {
        anchors.fill: parent; spacing: 12

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: "Server Settings"
                font.bold: true; font.pixelSize: 14
                color: "#e6edf3"; Layout.fillWidth: true
            }
            Button {
                text: "✕"; implicitWidth: 22; implicitHeight: 22
                onClicked: root.close()
                contentItem: Text {
                    text: parent.text; color: "#8b949e"
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

        ServerConfigGrid {
            Layout.fillWidth: true
            onMediaHostChanged: h => root.mediaHostChanged(h)
            onMediaPortChanged: p => root.mediaPortChanged(p)
            onS3HostChanged:    h => root.s3HostChanged(h)
            onS3PortChanged:    p => root.s3PortChanged(p)
        }
    }
}
