import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: mediaPanel
    color: "transparent"

    property int currentTab: 0

    // Service Health
    property string serviceStatus: "unknown"
    property string serviceVersion: ""
    property string lastHealthCheck: ""

    // Data (loaded from JSON config)
    property var jobs: []
    property var radioChannels: []
    property var tvChannels: []
    property var plugins: []

    property var tabModel: [
        { label: "Jobs" },
        { label: "Radio" },
        { label: "TV" },
        { label: "Plugins" }
    ]

    Component.onCompleted: {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText)
                jobs = data.jobs || []
                radioChannels = data.radioChannels || []
                tvChannels = data.tvChannels || []
                plugins = data.plugins || []
            }
        }
        xhr.open("GET", "config/media-mock-data.json")
        xhr.send()
        mediaService.healthCheck()
    }

    // Media Service HTTP Client
    QtObject {
        id: mediaService
        property string baseUrl: "http://localhost:8090"

        function request(method, endpoint, body, callback) {
            var xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var result = JSON.parse(xhr.responseText)
                            if (callback) callback(result, null)
                        } catch (e) {
                            if (callback) callback(null, "Parse error: " + e.message)
                        }
                    } else {
                        if (callback) callback(null, xhr.statusText || "Request failed (" + xhr.status + ")")
                    }
                }
            }
            var url = baseUrl + endpoint
            xhr.open(method, url)
            xhr.setRequestHeader("Content-Type", "application/json")
            if (body) { xhr.send(JSON.stringify(body)) } else { xhr.send() }
        }

        function healthCheck() {
            serviceStatus = "unknown"
            request("GET", "/health", null, function(result, error) {
                if (error) { serviceStatus = "offline"; serviceVersion = "" }
                else { serviceStatus = "online"; serviceVersion = result.version || "" }
                lastHealthCheck = Qt.formatDateTime(new Date(), "hh:mm:ss")
            })
            healthTimeout.start()
        }

        function submitJob(type, input, output, priority) {
            request("POST", "/api/jobs", { type: type, input: input, output: output, priority: priority }, function(result, error) {
                if (!error && result) {
                    var updated = jobs.slice()
                    updated.unshift({
                        id: result.id || ("job-" + (jobs.length + 1).toString().padStart(3, "0")),
                        type: type, status: "queued", progress: 0,
                        created: Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
                    })
                    jobs = updated
                }
            })
        }

        function cancelJob(jobId) { request("DELETE", "/api/jobs/" + jobId, null, null) }
    }

    Timer { id: healthTimeout; interval: 3000; repeat: false; onTriggered: { if (serviceStatus === "unknown") { serviceStatus = "offline"; lastHealthCheck = Qt.formatDateTime(new Date(), "hh:mm:ss") } } }
    Timer { id: healthPollTimer; interval: 30000; repeat: true; running: true; onTriggered: mediaService.healthCheck() }

    function cancelJobById(jobId) {
        mediaService.cancelJob(jobId)
        var updated = jobs.map(function(j) { return j.id === jobId ? Object.assign({}, j, { status: "failed", progress: j.progress }) : j })
        jobs = updated
    }

    function submitNewJob(type, input, output, priority) {
        if (input.length === 0 || output.length === 0) return
        mediaService.submitJob(type, input, output, priority)
    }

    function toggleRadioStream(index) {
        var updated = radioChannels.slice()
        var ch = Object.assign({}, updated[index])
        if (ch.status === "live") { ch.status = "offline"; ch.listeners = 0; ch.currentTrack = "---" }
        else { ch.status = "live"; ch.listeners = Math.floor(Math.random() * 200) + 10; ch.currentTrack = ch.playlist[0] }
        updated[index] = ch
        radioChannels = updated
    }

    function toggleTvBroadcast(index) {
        var updated = tvChannels.slice()
        var ch = Object.assign({}, updated[index])
        if (ch.status === "broadcasting") { ch.status = "offline"; ch.viewers = 0; ch.uptime = "0m" }
        else { ch.status = "broadcasting"; ch.viewers = Math.floor(Math.random() * 500) + 20; ch.uptime = "0m" }
        updated[index] = ch
        tvChannels = updated
    }

    // Main Layout
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // Header
        CCard {
            Layout.fillWidth: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 20
                spacing: 12

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 12
                    CText { variant: "h2"; text: "Media Service" }
                    CBadge { text: "God Panel" }
                    CStatusBadge {
                        status: serviceStatus === "online" ? "success" : serviceStatus === "offline" ? "error" : "warning"
                        text: serviceStatus === "online" ? "Online" : serviceStatus === "offline" ? "Offline" : "Checking..."
                    }
                    Item { Layout.fillWidth: true }
                    CButton { text: "Refresh"; variant: "ghost"; size: "sm"; onClicked: mediaService.healthCheck() }
                }
                CDivider { Layout.fillWidth: true }
                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8
                    CChip { text: jobs.length + " Jobs" }
                    CChip { text: radioChannels.length + " Radio Channels" }
                    CChip { text: tvChannels.length + " TV Channels" }
                    CChip { text: plugins.length + " Plugins" }
                    Item { Layout.fillWidth: true }
                    CText { visible: lastHealthCheck.length > 0; variant: "caption"; text: "Last check: " + lastHealthCheck; color: Theme.textSecondary }
                    CText { visible: serviceVersion.length > 0; variant: "caption"; text: "v" + serviceVersion; color: Theme.textSecondary }
                }
            }
        }

        CTabBar { id: tabBar; Layout.fillWidth: true; currentIndex: currentTab; onCurrentIndexChanged: currentTab = currentIndex; tabs: tabModel }

        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            // Jobs tab
            Rectangle {
                color: "transparent"
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        MediaJobForm {
                            id: jobForm
                            onSubmitRequested: {
                                submitNewJob(jobForm.jobTypes[jobForm.jobTypeIndex], jobForm.jobInputPath, jobForm.jobOutputPath, jobForm.jobPriorities[jobForm.jobPriorityIndex])
                                jobForm.jobInputPath = ""
                                jobForm.jobOutputPath = ""
                            }
                        }

                        MediaJobTable { jobs: mediaPanel.jobs; onCancelRequested: function(jobId) { cancelJobById(jobId) } }
                        Item { Layout.preferredHeight: 8 }
                    }
                }
            }

            // Radio tab
            MediaRadioTab { radioChannels: mediaPanel.radioChannels; onToggleStream: function(index) { toggleRadioStream(index) } }

            // TV tab
            MediaTvTab { tvChannels: mediaPanel.tvChannels; onToggleBroadcast: function(index) { toggleTvBroadcast(index) } }

            // Plugins tab
            MediaPluginsTab {
                plugins: mediaPanel.plugins
                onReloadAll: mediaService.request("POST", "/api/plugins/reload", null, null)
                onReloadPlugin: function(name) { mediaService.request("POST", "/api/plugins/" + name + "/reload", null, null) }
            }
        }
    }
}
