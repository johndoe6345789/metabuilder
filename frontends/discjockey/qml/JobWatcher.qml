import QtQuick
import DiscJockey 1.0

QtObject {
    id: root

    required property ApiClient api
    required property UploadClient uploader
    required property JobModel jobModel
    required property string selectedFile

    property Timer pollTimer: Timer {
        interval: 2000
        repeat: true
        property string jobId: ""
        onTriggered:
            if (jobId !== "")
                root.api.pollJob(jobId)
    }

    property Connections uploadConn: Connections {
        target: root.uploader
        function onUploadDone(localPath, url) {
            const ext = localPath
                .split(".").pop().toLowerCase()
            const out = url.replace(
                /\/([^/]+)$/, "/out-$1")
            if (ext === "mp4" || ext === "mkv"
                    || ext === "mov")
                root.api.submitVideoJob(
                    url, out, "h264")
            else
                root.api.submitAudioJob(
                    url, out, "mp3")
        }
    }

    property Connections apiConn: Connections {
        target: root.api
        function onJobSubmitted(id) {
            root.jobModel.addJob(
                id,
                root.selectedFile
                    .split("/").pop(),
                "transcode")
            root.pollTimer.jobId = id
            root.pollTimer.start()
        }
        function onJobUpdated(
            id, status, progress)
        {
            root.jobModel.updateJob(
                id, status, progress)
            if (status === "completed" ||
                status === "failed") {
                root.pollTimer.stop()
                root.pollTimer.jobId = ""
            }
        }
    }
}
