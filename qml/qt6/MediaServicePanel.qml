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

    // Jobs Data
    property var jobs: [
        { id: "job-001", type: "video",    status: "completed",  progress: 100, created: "2026-03-19 08:12:34" },
        { id: "job-002", type: "audio",    status: "processing", progress: 67,  created: "2026-03-19 09:45:01" },
        { id: "job-003", type: "image",    status: "queued",     progress: 0,   created: "2026-03-19 10:02:18" },
        { id: "job-004", type: "document", status: "failed",     progress: 23,  created: "2026-03-19 10:15:42" },
        { id: "job-005", type: "video",    status: "processing", progress: 34,  created: "2026-03-19 10:30:55" }
    ]

    // Radio Data
    property var radioChannels: [
        {
            name: "MetaBuilder FM", status: "live", listeners: 142,
            currentTrack: "Synthwave Dreams - NeonCoder", bitrate: "320 kbps",
            playlist: ["Synthwave Dreams - NeonCoder", "Digital Horizon - ByteRunner", "Midnight Protocol - CipherAce", "Neon Streets - RetroVolt", "Electric Soul - WaveForm"]
        },
        {
            name: "Chiptune Radio", status: "live", listeners: 87,
            currentTrack: "8-Bit Adventure - PixelMaster", bitrate: "192 kbps",
            playlist: ["8-Bit Adventure - PixelMaster", "Game Over Theme - ChipTuner", "Level Up! - BitCrafter", "Boss Battle - NEStalgia"]
        },
        {
            name: "Ambient Lounge", status: "offline", listeners: 0,
            currentTrack: "---", bitrate: "256 kbps",
            playlist: ["Deep Focus - AmbientWave", "Ocean Drift - CalmCode", "Forest Rain - NatureByte"]
        }
    ]

    // TV Data
    property var tvChannels: [
        {
            name: "MetaBuilder TV", status: "broadcasting", resolution: "1080p",
            viewers: 234, uptime: "6h 14m",
            schedule: [
                { time: "10:00", program: "Morning Code Review", duration: "60 min" },
                { time: "11:00", program: "Architecture Deep Dive", duration: "90 min" },
                { time: "12:30", program: "Live Build Session", duration: "120 min" },
                { time: "14:30", program: "Community Q&A", duration: "60 min" },
                { time: "15:30", program: "Plugin Showcase", duration: "45 min" }
            ]
        },
        {
            name: "Retro Gaming Channel", status: "offline", resolution: "720p",
            viewers: 0, uptime: "0m",
            schedule: [
                { time: "18:00", program: "Speedrun Saturday", duration: "120 min" },
                { time: "20:00", program: "Retro Reviews", duration: "60 min" },
                { time: "21:00", program: "Chiptune Live", duration: "90 min" }
            ]
        }
    ]

    // Plugins Data
    property var plugins: [
        { name: "FFmpeg",       version: "8.0.1",  status: "active",   capabilities: ["H.264", "H.265", "VP9", "AV1", "AAC", "FLAC", "Opus"] },
        { name: "ImageMagick",  version: "7.1.1",  status: "active",   capabilities: ["JPEG", "PNG", "WebP", "AVIF", "SVG", "TIFF", "Resize", "Crop"] },
        { name: "Pandoc",       version: "3.6.1",  status: "active",   capabilities: ["Markdown", "PDF", "DOCX", "HTML", "LaTeX", "EPUB"] },
        { name: "Radio",        version: "1.2.0",  status: "active",   capabilities: ["Icecast", "MP3 Stream", "OGG Stream", "Playlist", "Metadata"] },
        { name: "LibRetro",     version: "1.19.1", status: "inactive", capabilities: ["NES", "SNES", "Genesis", "GBA", "N64", "PS1", "Recording"] }
    ]

    property var tabModel: [
        { label: "Jobs" },
        { label: "Radio" },
        { label: "TV" },
        { label: "Plugins" }
    ]

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
    Component.onCompleted: mediaService.healthCheck()

    function cancelJobById(jobId) {
        mediaService.cancelJob(jobId)
        var updated = jobs.map(function(j) { return j.id === jobId ? Object.assign({}, j, { status: "failed", progress: j.progress }) : j })
        jobs = updated
    }

    function submitNewJob(type, input, output, priority) {
        if (input.length === 0 || output.length === 0) return
        mediaService.submitJob(type, input, output, priority)
        var newJob = { id: "job-" + (jobs.length + 1).toString().padStart(3, "0"), type: type, status: "queued", progress: 0, created: Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss") }
        var updated = jobs.slice()
        updated.unshift(newJob)
        jobs = updated
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
