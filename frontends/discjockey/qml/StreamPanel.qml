import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "#0f1117"

    property string selectedFile: ""
    property var    jobModel: null
    property var    uploader: null

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
            if (path === root.selectedFile) root.uploading = false
        }
        function onUploadError(path) {
            if (path === root.selectedFile) root.uploading = false
        }
    }

    readonly property string fileName:
        selectedFile !== "" ? selectedFile.split("/").pop() : ""
    readonly property string fileExt:
        fileName !== "" ? fileName.split(".").pop().toLowerCase() : ""
    readonly property bool isVideo:
        fileExt === "mp4" || fileExt === "mkv" || fileExt === "mov"

    // Convert filesystem path → QUrl string for MediaPlayer
    readonly property string mediaSource:
        selectedFile !== "" ? "file://" + selectedFile : ""

    ColumnLayout {
        anchors.fill: parent; spacing: 0

        // ── Preview player (fills remaining height) ──────────────────
        StreamPreview {
            id: preview
            Layout.fillWidth: true
            Layout.fillHeight: true
            source:  root.mediaSource
            isVideo: root.isVideo
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: "#30363d" }

        // ── Upload controls ──────────────────────────────────────────
        UploadProgress {
            Layout.fillWidth: true
            Layout.margins: 12
            uploadPct: root.uploadPct
            uploading: root.uploading
            hasFile:   root.selectedFile !== ""
            onStream:  root.stream()
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: "#30363d" }

        // ── Job queue ────────────────────────────────────────────────
        JobQueue {
            model: root.jobModel
            Layout.fillWidth: true
            Layout.preferredHeight: 190
        }
    }
}
