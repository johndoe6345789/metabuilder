import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    height: 36
    radius: 4
    color: "#161b22"

    required property string jobFile
    required property string jobType
    required property string jobStatus
    required property real   jobProgress

    function statusColor(s) {
        switch(s) {
        case "processing": return "#0ea5e9"
        case "completed":  return "#3fb950"
        case "failed":     return "#f85149"
        default:           return "#8b949e"
        }
    }

    RowLayout {
        anchors {
            fill: parent
            margins: 6
        }
        spacing: 8

        Label {
            text: root.jobFile
            color: "#e6edf3"
            font.pixelSize: 12
            elide: Text.ElideRight
            Layout.fillWidth: true
        }

        Rectangle {
            color: "#30363d"
            radius: 3
            width: typeLbl.width + 8
            height: 18
            Label {
                id: typeLbl
                text: root.jobType.toUpperCase()
                color: "#8b949e"
                font.pixelSize: 10
                anchors.centerIn: parent
            }
        }

        ProgressBar {
            id: pb
            value: root.jobProgress / 100
            implicitWidth: 80
            implicitHeight: 6
            background: Rectangle {
                color: "#0f1117"
                radius: 3
            }
            contentItem: Item {
                Rectangle {
                    width: pb.visualPosition
                        * parent.width
                    height: parent.height
                    radius: 3
                    color: root.statusColor(
                        root.jobStatus)
                }
            }
        }

        Label {
            text: root.jobStatus
            color: root.statusColor(
                root.jobStatus)
            font.pixelSize: 11
            Layout.preferredWidth: 80
        }
    }
}
