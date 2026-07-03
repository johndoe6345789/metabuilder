import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Dialogs
import DiscJockey 1.0

ApplicationWindow {
    id: root
    visible: true
    width: 1100; height: 700
    title: "DiscJockey"
    color: "#0f1117"
    onClosing: close => {
        var tabs = []; var i
        for (i = 0; i < tabModel.count; i++) {
            var t = tabModel.get(i)
            tabs.push({ filePath: t.filePath, fileName: t.fileName,
                        fileExt: t.fileExt, tabType: t.tabType,
                        pinned: t.pinned })
        }
        session.save(tabs, fileModel.allFilePaths(), currentTab)
    }

    Connections {
        target: trayManager
        function onRestoreRequested() { root.show(); root.raise() }
    }

    FileModel    { id: fileModel }
    JobModel     { id: jobModel }
    ApiClient    { id: api }
    UploadClient { id: uploader; bucket: "media-uploads" }
    Session      { id: session }

    ListModel { id: tabModel }
    property int currentTab: -1

    readonly property string currentTabType:
        currentTab >= 0 && currentTab < tabModel.count
        ? tabModel.get(currentTab).tabType : ""

    readonly property bool sidebarVisible:
        currentTabType === "stream" || tabModel.count === 0

    Component.onCompleted: {
        var data = session.load()
        if (data.files) fileModel.addFiles(data.files)
        if (data.tabs) {
            for (var i = 0; i < data.tabs.length; i++) {
                var t = data.tabs[i]
                tabModel.append({
                    filePath: t.filePath, fileName: t.fileName,
                    fileExt: t.fileExt, tabType: t.tabType,
                    pinned: t.pinned || false
                })
            }
        }
        if (data.currentTab !== undefined && data.currentTab >= 0)
            currentTab = data.currentTab
    }

    function openStreamTab() {
        tabModel.append({ filePath: "", fileName: "New Stream",
            fileExt: "", tabType: "stream", pinned: false })
        currentTab = tabModel.count - 1
    }

    function openTab(path, type, pinned) {
        for (var i = 0; i < tabModel.count; i++) {
            var t = tabModel.get(i)
            if (t.filePath === path && t.tabType === type) {
                currentTab = i; return
            }
        }
        var name = path.split("/").pop()
        var ext  = name.split(".").pop().toLowerCase()
        tabModel.append({
            filePath: path, fileName: name, fileExt: ext,
            tabType: type, pinned: pinned === true
        })
        currentTab = tabModel.count - 1
    }

    function autoOpen(path) {
        var ext = path.split(".").pop().toLowerCase()
        openTab(path,
            (ext === "mp3" || ext === "flac" || ext === "ogg"
             || ext === "wav" || ext === "aac" || ext === "m4a")
            ? "music" : "video")
    }

    function addAndOpen(paths, type) {
        fileModel.addFiles(paths)
        if (paths.length > 0) openTab(paths[0], type)
    }

    // ── File dialogs (for "+" dropdown) ──────────────────
    FileDialog {
        id: audioDlg
        title: "Open Audio File"
        fileMode: FileDialog.OpenFiles
        nameFilters: ["Audio (*.mp3 *.flac *.ogg *.wav *.aac *.m4a)"]
        onAccepted: {
            var paths = selectedFiles.map(
                f => f.toString().replace(/^file:\/\//, ""))
            root.addAndOpen(paths, "music")
        }
    }
    FileDialog {
        id: videoDlg
        title: "Open Video File"
        fileMode: FileDialog.OpenFiles
        nameFilters: ["Video (*.mp4 *.mkv *.mov *.avi *.webm)"]
        onAccepted: {
            var paths = selectedFiles.map(
                f => f.toString().replace(/^file:\/\//, ""))
            root.addAndOpen(paths, "video")
        }
    }
    // streamDlg used by the StreamingPanel's internal Browse button
    FileDialog {
        id: streamDlg
        title: "Select File to Stream"
        fileMode: FileDialog.OpenFile
        nameFilters: ["Media (*.mp3 *.mp4 *.mkv *.flac *.mov *.ogg *.wav)"]
        property int targetTab: -1
        onAccepted: {
            var path = selectedFile.toString().replace(/^file:\/\//, "")
            fileModel.addFiles([path])
            if (targetTab >= 0 && targetTab < tabModel.count) {
                var name = path.split("/").pop()
                var ext  = name.split(".").pop().toLowerCase()
                tabModel.setProperty(targetTab, "filePath", path)
                tabModel.setProperty(targetTab, "fileName", name)
                tabModel.setProperty(targetTab, "fileExt",  ext)
            } else {
                root.openTab(path, "stream")
            }
        }
    }

    JobWatcher {
        api: api; uploader: uploader; jobModel: jobModel
        selectedFile: currentTab >= 0 && currentTab < tabModel.count
                      ? tabModel.get(currentTab).filePath : ""
    }

    SettingsPopup {
        id: settingsPopup
        x: root.width - width - 16
        y: toolbar.height + tabStrip.height + 8
        onMediaHostChanged: h => { api.host = h }
        onMediaPortChanged: p => { api.port = p }
        onS3HostChanged:    h => { uploader.host = h }
        onS3PortChanged:    p => { uploader.port = p }
    }

    // ── Keyboard shortcuts ───────────────────────────────
    Shortcut { sequence: "Ctrl+W"; onActivated: {
        if (currentTab < 0) return
        var t = tabModel.get(currentTab)
        if (t && !t.pinned) { tabModel.remove(currentTab)
            var n = tabModel.count
            currentTab = n === 0 ? -1 : Math.min(currentTab, n-1) }
    }}
    Shortcut { sequence: "Ctrl+Tab"; onActivated: {
        if (tabModel.count > 0) currentTab = (currentTab+1) % tabModel.count }}
    Shortcut { sequence: "Ctrl+Shift+Tab"; onActivated: {
        if (tabModel.count > 0)
            currentTab = (currentTab-1+tabModel.count) % tabModel.count }}
    Shortcut { sequence: "Ctrl+1"; onActivated: audioDlg.open() }
    Shortcut { sequence: "Ctrl+2"; onActivated: videoDlg.open() }
    Shortcut { sequence: "Ctrl+3"; onActivated: root.openStreamTab() }

    Component { id: musicComp;  MusicPanel     {} }
    Component { id: videoComp;  VideoPanel     {} }
    Component { id: streamComp; StreamingPanel {} }

    ColumnLayout {
        anchors.fill: parent; spacing: 0

        AppToolBar {
            id: toolbar; Layout.fillWidth: true
            onSettingsRequested:       settingsPopup.open()
            onMinimizeToTrayRequested: root.hide()
        }

        TabStrip {
            id: tabStrip; Layout.fillWidth: true
            model: tabModel; currentIndex: root.currentTab
            onTabSelected: i => { root.currentTab = i }
            onTabClosed: i => {
                var t = tabModel.get(i)
                if (t && t.pinned) return
                tabModel.remove(i)
                var n = tabModel.count
                root.currentTab = n === 0
                    ? -1 : Math.min(root.currentTab, n - 1)
            }
            onTabPinToggled: i => {
                var t = tabModel.get(i)
                tabModel.setProperty(i, "pinned", !t.pinned)
            }
            onNewAudioRequested:  audioDlg.open()
            onNewVideoRequested:  videoDlg.open()
            onNewStreamRequested: root.openStreamTab()
            onTabReordered: (from, to) => {
                var cur = root.currentTab
                if      (cur === from) root.currentTab = to
                else if (from < to && cur > from && cur <= to) root.currentTab = cur - 1
                else if (from > to && cur >= to && cur < from) root.currentTab = cur + 1
            }
        }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0

            FileBrowser {
                id: browser
                model: fileModel
                visible: root.sidebarVisible
                activeFile: currentTab >= 0 && currentTab < tabModel.count
                            ? tabModel.get(currentTab).filePath : ""
                Layout.preferredWidth: root.sidebarVisible ? 320 : 0
                Layout.fillHeight: true
                onFileOpenRequested: path => root.autoOpen(path)
                onStreamRequested: path => {
                    // Populate current empty stream tab instead of creating new one
                    if (root.currentTabType === "stream" && root.currentTab >= 0
                        && tabModel.get(root.currentTab).filePath === "") {
                        var n = path.split("/").pop()
                        tabModel.setProperty(root.currentTab, "filePath", path)
                        tabModel.setProperty(root.currentTab, "fileName", n)
                        tabModel.setProperty(root.currentTab, "fileExt",
                            n.split(".").pop().toLowerCase())
                    } else {
                        root.openTab(path, "stream")
                    }
                }
                Behavior on Layout.preferredWidth {
                    NumberAnimation { duration: 180 }
                }
            }

            Rectangle {
                visible: root.sidebarVisible
                width: 1; Layout.fillHeight: true; color: "#30363d"
            }

            Item {
                Layout.fillWidth: true; Layout.fillHeight: true

                Repeater {
                    model: tabModel
                    Item {
                        id: slot
                        property string fp: filePath
                        property string tt: tabType
                        anchors.fill: parent
                        visible: index === root.currentTab

                        Loader {
                            id: panelLoader
                            anchors.fill: parent
                            sourceComponent: slot.tt === "video"  ? videoComp
                                           : slot.tt === "stream" ? streamComp
                                           :                        musicComp
                            onLoaded: {
                                if (slot.tt === "stream") {
                                    item.jobModel = jobModel
                                    item.uploader = uploader
                                }
                            }
                            Binding {
                                target: panelLoader.item
                                property: "selectedFile"
                                value: slot.fp
                                when: panelLoader.status === Loader.Ready
                            }
                            Connections {
                                target: (panelLoader.status === Loader.Ready
                                    && slot.tt === "stream")
                                    ? panelLoader.item : null
                                function onBrowseRequested() {
                                    streamDlg.targetTab = index
                                    streamDlg.open()
                                }
                            }
                        }
                    }
                }

                ColumnLayout {
                    visible: tabModel.count === 0
                    anchors.centerIn: parent; spacing: 12
                    Label {
                        text: "Open a file to get started"
                        color: "#484f58"; font.pixelSize: 15
                        Layout.alignment: Qt.AlignHCenter
                    }
                    Label {
                        text: "Use  +  above to open audio, video, or stream tabs"
                        color: "#30363d"; font.pixelSize: 12
                        Layout.alignment: Qt.AlignHCenter
                    }
                }
            }
        }
    }
}
