import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "#0f1117"

    required property string selectedFile
    required property var    jobModel
    required property var    uploader

    signal stream()

    property int  uploadPct: 0
    property bool uploading: false

    Connections {
        target: root.uploader
        function onUploadProgress(path, pct) {
            if (path !== root.selectedFile) return
            root.uploadPct = pct
            root.uploading = true
        }
        function onUploadDone(path) {
            if (path === root.selectedFile)
                root.uploading = false
        }
        function onUploadError(path) {
            if (path === root.selectedFile)
                root.uploading = false
        }
    }

    readonly property string fileName:
        selectedFile !== ""
            ? selectedFile.split("/").pop() : ""
    readonly property string fileExt:
        fileName !== ""
            ? fileName.split(".").pop().toLowerCase() : ""
    readonly property bool isVideo:
        fileExt === "mp4" || fileExt === "mkv"
            || fileExt === "mov"

    ColumnLayout {
        anchors.fill: parent; spacing: 0

        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true

            ColumnLayout {
                anchors.centerIn: parent
                width: Math.min(parent.width - 48, 480)
                spacing: 16

                FileInfo {
                    Layout.fillWidth: true
                    fileName: root.fileName
                    fileExt:  root.fileExt
                    isVideo:  root.isVideo
                }

                UploadProgress {
                    Layout.fillWidth: true
                    uploadPct: root.uploadPct
                    uploading: root.uploading
                    hasFile:   root.selectedFile !== ""
                    onStream:  root.stream()
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true; height: 1; color: "#30363d"
        }

        JobQueue {
            model: root.jobModel
            Layout.fillWidth: true
            Layout.preferredHeight: 190
        }
    }
}
