import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Dialogs

Rectangle {
    id: root
    color: "#161b22"

    required property var model
    signal fileSelected(string path)
    property string selectedFile: ""

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 8
        spacing: 6

        FileBrowserHeader {
            Layout.fillWidth: true
            onAddClicked: fileDialog.open()
        }

        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#30363d"
        }

        ListView {
            id: listView
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.model
            clip: true
            spacing: 2

            delegate: FileItem {
                width: listView.width
                filePath:    model.filePath
                fileName:    model.fileName
                fileExt:     model.fileExt
                fileSizeStr: model.fileSizeStr
                isSelected:
                    root.selectedFile
                        === model.filePath
                onClicked: path => {
                    root.selectedFile = path
                    root.fileSelected(path)
                }
            }
        }
    }

    FileDialog {
        id: fileDialog
        title: "Add Media Files"
        fileMode: FileDialog.OpenFiles
        nameFilters: [
            "Media files"
            + " (*.mp3 *.mp4 *.mkv *.flac)"]
        onAccepted: {
            const paths = selectedFiles.map(
                f => f.toString()
                    .replace(/^file:\/\//, ""))
            root.model.addFiles(paths)
        }
    }
}
