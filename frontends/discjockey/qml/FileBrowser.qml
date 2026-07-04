import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Dialogs

Rectangle {
    id: root
    color: "#161b22"

    required property var model
    property string activeFile: ""  // path of the currently active tab

    signal fileOpenRequested(string path)
    signal streamRequested(string path)

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 8

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: "Queue"
                font.bold: true; font.pixelSize: 14
                color: "#e6edf3"; Layout.fillWidth: true
            }
            Button {
                text: "+ Add"
                implicitWidth: 64; implicitHeight: 28
                onClicked: fileDialog.open()
                contentItem: Text {
                    text: parent.text; color: "#e6edf3"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 12
                }
                background: Rectangle { color: "#7c3aed"; radius: 4 }
            }
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: "#30363d" }

        Item {
            Layout.fillWidth: true; Layout.fillHeight: true

            ListView {
                id: lv
                anchors.fill: parent
                model: root.model
                clip: true; spacing: 3

                delegate: FileItem {
                    width: lv.width
                    filePath:    model.filePath    || ""
                    fileName:    model.fileName    || ""
                    fileExt:     model.fileExt     || ""
                    fileSizeStr: model.fileSizeStr || ""
                    isSelected:  root.activeFile !== ""
                        && root.activeFile === model.filePath
                    onClicked:         p => root.fileOpenRequested(p)
                    onStreamRequested: p => root.streamRequested(p)
                    onRemoved: root.model.removeFile(index)
                }
            }

            Label {
                visible: lv.count === 0
                anchors.centerIn: parent
                text: "Click + Add to queue files\n\n"
                    + "mp3 · mp4 · mkv · flac · mov"
                color: "#484f58"; font.pixelSize: 12
                horizontalAlignment: Text.AlignHCenter
            }
        }
    }

    FileDialog {
        id: fileDialog
        title: "Add Media Files"
        fileMode: FileDialog.OpenFiles
        nameFilters: [ "Media files (*.mp3 *.mp4 *.mkv *.flac *.mov)" ]
        onAccepted: root.model.addFiles(
            selectedFiles.map(f => f.toString().replace(/^file:\/\//, ""))
        )
    }
}
