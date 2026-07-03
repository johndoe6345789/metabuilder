import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: root
    spacing: 6

    required property int  uploadPct
    required property bool uploading
    required property bool hasFile

    signal stream()

    ProgressBar {
        id: pb
        visible: root.uploading
        value: root.uploadPct / 100
        Layout.fillWidth: true
        background: Rectangle {
            color: "#0f1117"; radius: 4
        }
        contentItem: Item {
            Rectangle {
                width: pb.visualPosition
                    * parent.width
                height: parent.height
                color: "#0ea5e9"
                radius: 4
            }
        }
    }

    Label {
        visible: root.uploading
        text: "Uploading… "
            + root.uploadPct + "%"
        color: "#0ea5e9"
        font.pixelSize: 12
        Layout.alignment: Qt.AlignHCenter
    }

    Button {
        text: "Stream to MetaBuilder"
        enabled: root.hasFile
            && !root.uploading
        Layout.alignment: Qt.AlignHCenter
        implicitWidth: 220
        implicitHeight: 44
        onClicked: root.stream()
        contentItem: Text {
            text: parent.text
            color: parent.enabled
                ? "#e6edf3" : "#8b949e"
            horizontalAlignment:
                Text.AlignHCenter
            verticalAlignment:
                Text.AlignVCenter
            font.pixelSize: 14
            font.bold: true
        }
        background: Rectangle {
            color: parent.enabled
                ? "#7c3aed" : "#30363d"
            radius: 8
        }
    }
}
