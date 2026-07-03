import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "#161b22"

    required property string selectedFile
    required property var uploader
    signal stream()
    signal mediaHostChanged(string host)
    signal mediaPortChanged(int port)
    signal s3HostChanged(string host)
    signal s3PortChanged(int port)

    property int  uploadPct: 0
    property bool uploading: false

    Connections {
        target: root.uploader
        function onUploadProgress(path, pct) {
            if (path !== root.selectedFile)
                return
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
            ? selectedFile.split("/").pop()
            : ""
    readonly property string fileExt:
        fileName !== ""
            ? fileName.split(".")
                .pop().toLowerCase()
            : ""
    readonly property bool isVideo:
        fileExt === "mp4"
            || fileExt === "mkv"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 24
        spacing: 16

        Item { Layout.fillHeight: true }

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
            hasFile:
                root.selectedFile !== ""
            onStream: root.stream()
        }

        Item { Layout.fillHeight: true }

        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#30363d"
        }

        ServerConfig {
            Layout.fillWidth: true
            implicitHeight: 90
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
