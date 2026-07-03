import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DiscJockey 1.0

ApplicationWindow {
    id: root
    visible: true
    width: 1100; height: 700
    title: "DiscJockey"
    color: "#0f1117"

    FileModel    { id: fileModel }
    JobModel     { id: jobModel }
    ApiClient    { id: api }
    UploadClient { id: uploader; bucket: "media-uploads" }

    JobWatcher {
        api:          api
        uploader:     uploader
        jobModel:     jobModel
        selectedFile: browser.selectedFile
    }

    SettingsPopup {
        id: settingsPopup
        x: root.width - width - 16
        y: toolbar.height + 8
        onMediaHostChanged: h => { api.host = h }
        onMediaPortChanged: p => { api.port = p }
        onS3HostChanged:    h => { uploader.host = h }
        onS3PortChanged:    p => { uploader.port = p }
    }

    ColumnLayout {
        anchors.fill: parent; spacing: 0

        AppToolBar {
            id: toolbar
            Layout.fillWidth: true
            onSettingsRequested: settingsPopup.open()
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 1

            FileBrowser {
                id: browser
                model: fileModel
                Layout.preferredWidth: 320
                Layout.fillHeight: true
            }

            StreamPanel {
                selectedFile: browser.selectedFile
                jobModel:     jobModel
                uploader:     uploader
                Layout.fillWidth: true
                Layout.fillHeight: true
                onStream: uploader.upload(browser.selectedFile)
            }
        }
    }
}
