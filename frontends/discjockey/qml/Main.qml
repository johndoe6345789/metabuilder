import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DiscJockey 1.0

ApplicationWindow {
    id: root
    visible: true
    width: 1100
    height: 700
    title: "DiscJockey"
    color: "#0f1117"

    FileModel    { id: fileModel }
    JobModel     { id: jobModel }
    ApiClient    {
        id: api
        host: toolbar.mediaHost || "localhost"
        port: parseInt(toolbar.mediaPort) || 8090
    }
    UploadClient {
        id: uploader
        bucket: "media-uploads"
    }

    JobWatcher {
        api:          api
        uploader:     uploader
        jobModel:     jobModel
        selectedFile: browser.selectedFile
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        AppToolBar {
            id: toolbar
            Layout.fillWidth: true
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 1

            FileBrowser {
                id: browser
                model: fileModel
                Layout.preferredWidth: 280
                Layout.fillHeight: true
            }

            StreamPanel {
                selectedFile: browser.selectedFile
                uploader: uploader
                Layout.fillWidth: true
                Layout.fillHeight: true
                onStream:
                    uploader.upload(
                        browser.selectedFile)
                onMediaHostChanged:
                    h => { api.host = h }
                onMediaPortChanged:
                    p => { api.port = p }
                onS3HostChanged:
                    h => { uploader.host = h }
                onS3PortChanged:
                    p => { uploader.port = p }
            }
        }

        JobQueue {
            model: jobModel
            Layout.fillWidth: true
            Layout.preferredHeight: 150
        }
    }
}
