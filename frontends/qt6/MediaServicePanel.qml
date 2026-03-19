import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: mediaPanel
    color: "transparent"

    property int currentTab: 0

    // ── Service Health ───────────────────────────────────────────────────
    property string serviceStatus: "unknown"  // unknown, online, offline
    property string serviceVersion: ""
    property string lastHealthCheck: ""

    // ── Job Submission Form ──────────────────────────────────────────────
    property int jobTypeIndex: 0
    property var jobTypes: ["video", "audio", "document", "image"]
    property string jobInputPath: ""
    property string jobOutputPath: ""
    property int jobPriorityIndex: 2
    property var jobPriorities: ["urgent", "high", "normal", "low"]

    // ── Jobs Data ────────────────────────────────────────────────────────
    property var jobs: [
        { id: "job-001", type: "video",    status: "completed",  progress: 100, created: "2026-03-19 08:12:34" },
        { id: "job-002", type: "audio",    status: "processing", progress: 67,  created: "2026-03-19 09:45:01" },
        { id: "job-003", type: "image",    status: "queued",     progress: 0,   created: "2026-03-19 10:02:18" },
        { id: "job-004", type: "document", status: "failed",     progress: 23,  created: "2026-03-19 10:15:42" },
        { id: "job-005", type: "video",    status: "processing", progress: 34,  created: "2026-03-19 10:30:55" }
    ]

    // ── Radio Data ───────────────────────────────────────────────────────
    property int selectedRadioIndex: 0
    property var radioChannels: [
        {
            name: "MetaBuilder FM", status: "live", listeners: 142,
            currentTrack: "Synthwave Dreams - NeonCoder", bitrate: "320 kbps",
            playlist: [
                "Synthwave Dreams - NeonCoder",
                "Digital Horizon - ByteRunner",
                "Midnight Protocol - CipherAce",
                "Neon Streets - RetroVolt",
                "Electric Soul - WaveForm"
            ]
        },
        {
            name: "Chiptune Radio", status: "live", listeners: 87,
            currentTrack: "8-Bit Adventure - PixelMaster", bitrate: "192 kbps",
            playlist: [
                "8-Bit Adventure - PixelMaster",
                "Game Over Theme - ChipTuner",
                "Level Up! - BitCrafter",
                "Boss Battle - NEStalgia"
            ]
        },
        {
            name: "Ambient Lounge", status: "offline", listeners: 0,
            currentTrack: "---", bitrate: "256 kbps",
            playlist: [
                "Deep Focus - AmbientWave",
                "Ocean Drift - CalmCode",
                "Forest Rain - NatureByte"
            ]
        }
    ]

    // ── TV Data ──────────────────────────────────────────────────────────
    property int selectedTvIndex: 0
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

    // ── Plugins Data ─────────────────────────────────────────────────────
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

    // ── Media Service HTTP Client ────────────────────────────────────────
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
            if (body) {
                xhr.send(JSON.stringify(body))
            } else {
                xhr.send()
            }
        }

        function healthCheck() {
            serviceStatus = "unknown"
            request("GET", "/health", null, function(result, error) {
                if (error) {
                    serviceStatus = "offline"
                    serviceVersion = ""
                } else {
                    serviceStatus = "online"
                    serviceVersion = result.version || ""
                }
                lastHealthCheck = Qt.formatDateTime(new Date(), "hh:mm:ss")
            })
            // Fallback: if no response after 3 seconds, mark offline
            healthTimeout.start()
        }

        function submitJob(type, input, output, priority) {
            request("POST", "/api/jobs", {
                type: type,
                input: input,
                output: output,
                priority: priority
            }, function(result, error) {
                if (!error && result) {
                    var updated = jobs.slice()
                    updated.unshift({
                        id: result.id || ("job-" + (jobs.length + 1).toString().padStart(3, "0")),
                        type: type,
                        status: "queued",
                        progress: 0,
                        created: Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
                    })
                    jobs = updated
                }
            })
        }

        function cancelJob(jobId) {
            request("DELETE", "/api/jobs/" + jobId, null, null)
        }
    }

    Timer {
        id: healthTimeout
        interval: 3000
        repeat: false
        onTriggered: {
            if (serviceStatus === "unknown") {
                serviceStatus = "offline"
                lastHealthCheck = Qt.formatDateTime(new Date(), "hh:mm:ss")
            }
        }
    }

    Timer {
        id: healthPollTimer
        interval: 30000
        repeat: true
        running: true
        onTriggered: mediaService.healthCheck()
    }

    Component.onCompleted: {
        mediaService.healthCheck()
    }

    // ── Helper Functions ─────────────────────────────────────────────────
    function jobStatusColor(status) {
        switch (status) {
            case "completed":  return "success"
            case "processing": return "warning"
            case "queued":     return "info"
            case "failed":     return "error"
            default:           return "info"
        }
    }

    function cancelJobById(jobId) {
        mediaService.cancelJob(jobId)
        var updated = jobs.map(function(j) {
            return j.id === jobId ? Object.assign({}, j, { status: "failed", progress: j.progress }) : j
        })
        jobs = updated
    }

    function submitNewJob() {
        if (jobInputPath.length === 0 || jobOutputPath.length === 0) return
        var type = jobTypes[jobTypeIndex]
        var priority = jobPriorities[jobPriorityIndex]

        // Try live service first
        mediaService.submitJob(type, jobInputPath, jobOutputPath, priority)

        // Optimistic local update (mock fallback)
        var newJob = {
            id: "job-" + (jobs.length + 1).toString().padStart(3, "0"),
            type: type,
            status: "queued",
            progress: 0,
            created: Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
        }
        var updated = jobs.slice()
        updated.unshift(newJob)
        jobs = updated

        jobInputPath = ""
        jobOutputPath = ""
    }

    function toggleRadioStream(index) {
        var updated = radioChannels.slice()
        var ch = Object.assign({}, updated[index])
        if (ch.status === "live") {
            ch.status = "offline"
            ch.listeners = 0
            ch.currentTrack = "---"
        } else {
            ch.status = "live"
            ch.listeners = Math.floor(Math.random() * 200) + 10
            ch.currentTrack = ch.playlist[0]
        }
        updated[index] = ch
        radioChannels = updated
    }

    function toggleTvBroadcast(index) {
        var updated = tvChannels.slice()
        var ch = Object.assign({}, updated[index])
        if (ch.status === "broadcasting") {
            ch.status = "offline"
            ch.viewers = 0
            ch.uptime = "0m"
        } else {
            ch.status = "broadcasting"
            ch.viewers = Math.floor(Math.random() * 500) + 20
            ch.uptime = "0m"
        }
        updated[index] = ch
        tvChannels = updated
    }

    function resolutionColor(res) {
        switch (res) {
            case "1080p": return Theme.success
            case "720p":  return Theme.warning
            case "480p":  return Theme.error
            default:      return Theme.textSecondary
        }
    }

    // ── Main Layout ──────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // ══════════════════════════════════════════
        // Header
        // ══════════════════════════════════════════
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
                        status: serviceStatus === "online" ? "success"
                              : serviceStatus === "offline" ? "error"
                              : "warning"
                        text: serviceStatus === "online" ? "Online"
                            : serviceStatus === "offline" ? "Offline"
                            : "Checking..."
                    }

                    Item { Layout.fillWidth: true }

                    CButton {
                        text: "Refresh"
                        variant: "ghost"
                        size: "sm"
                        onClicked: mediaService.healthCheck()
                    }
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

                    CText {
                        visible: lastHealthCheck.length > 0
                        variant: "caption"
                        text: "Last check: " + lastHealthCheck
                        color: Theme.textSecondary
                    }
                    CText {
                        visible: serviceVersion.length > 0
                        variant: "caption"
                        text: "v" + serviceVersion
                        color: Theme.textSecondary
                    }
                }
            }
        }

        // ── Tab bar ──
        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            tabs: tabModel
        }

        // ── Tab content ──
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            // ══════════════════════════════════════════
            // 0 - JOBS
            // ══════════════════════════════════════════
            Rectangle {
                color: "transparent"

                ScrollView {
                    anchors.fill: parent
                    clip: true

                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        // ── Job Submission Form ──
                        CCard {
                            Layout.fillWidth: true

                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 12

                                CText { variant: "h4"; text: "Submit Job" }
                                CDivider { Layout.fillWidth: true }

                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    // Type selector
                                    ColumnLayout {
                                        Layout.preferredWidth: 200
                                        spacing: 4

                                        CText { variant: "caption"; text: "Type" }

                                        RowLayout {
                                            spacing: 4

                                            Repeater {
                                                model: jobTypes
                                                delegate: CButton {
                                                    text: modelData
                                                    variant: jobTypeIndex === index ? "primary" : "ghost"
                                                    size: "sm"
                                                    onClicked: jobTypeIndex = index
                                                }
                                            }
                                        }
                                    }

                                    CTextField {
                                        Layout.fillWidth: true
                                        label: "Input Path"
                                        placeholderText: "/media/input/video.mp4"
                                        text: jobInputPath
                                        onTextChanged: jobInputPath = text
                                    }

                                    CTextField {
                                        Layout.fillWidth: true
                                        label: "Output Path"
                                        placeholderText: "/media/output/video.webm"
                                        text: jobOutputPath
                                        onTextChanged: jobOutputPath = text
                                    }
                                }

                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 8

                                    // Priority selector
                                    CText { variant: "caption"; text: "Priority:" }

                                    Repeater {
                                        model: jobPriorities
                                        delegate: CButton {
                                            text: modelData
                                            variant: jobPriorityIndex === index ? "primary" : "ghost"
                                            size: "sm"
                                            onClicked: jobPriorityIndex = index
                                        }
                                    }

                                    Item { Layout.fillWidth: true }

                                    CButton {
                                        text: "Submit Job"
                                        variant: "primary"
                                        enabled: jobInputPath.length > 0 && jobOutputPath.length > 0
                                        onClicked: submitNewJob()
                                    }
                                }
                            }
                        }

                        // ── Active Jobs Table ──
                        CCard {
                            Layout.fillWidth: true

                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 12

                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    CText { variant: "h4"; text: "Active Jobs" }
                                    CText { variant: "caption"; text: jobs.length + " total"; color: Theme.textSecondary }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Table header
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 8

                                    CText { variant: "caption"; text: "ID";       Layout.preferredWidth: 100 }
                                    CText { variant: "caption"; text: "Type";     Layout.preferredWidth: 80 }
                                    CText { variant: "caption"; text: "Status";   Layout.preferredWidth: 100 }
                                    CText { variant: "caption"; text: "Progress"; Layout.fillWidth: true }
                                    CText { variant: "caption"; text: "Created";  Layout.preferredWidth: 160 }
                                    CText { variant: "caption"; text: "";          Layout.preferredWidth: 70 }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Job rows
                                Repeater {
                                    model: jobs

                                    delegate: ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 4

                                        FlexRow {
                                            Layout.fillWidth: true
                                            spacing: 8

                                            CText {
                                                variant: "body2"
                                                text: modelData.id
                                                font.family: "monospace"
                                                Layout.preferredWidth: 100
                                            }

                                            CBadge {
                                                text: modelData.type
                                                Layout.preferredWidth: 80
                                            }

                                            CStatusBadge {
                                                status: jobStatusColor(modelData.status)
                                                text: modelData.status
                                                Layout.preferredWidth: 100
                                            }

                                            // Progress bar area
                                            Rectangle {
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 20
                                                color: "transparent"

                                                Rectangle {
                                                    anchors.verticalCenter: parent.verticalCenter
                                                    width: parent.width
                                                    height: 6
                                                    radius: 3
                                                    color: Theme.border

                                                    Rectangle {
                                                        width: parent.width * (modelData.progress / 100)
                                                        height: parent.height
                                                        radius: 3
                                                        color: modelData.status === "failed" ? Theme.error
                                                             : modelData.status === "completed" ? Theme.success
                                                             : Theme.primary
                                                    }
                                                }

                                                CText {
                                                    anchors.right: parent.right
                                                    anchors.verticalCenter: parent.verticalCenter
                                                    variant: "caption"
                                                    text: modelData.progress + "%"
                                                }
                                            }

                                            CText {
                                                variant: "caption"
                                                text: modelData.created
                                                Layout.preferredWidth: 160
                                                color: Theme.textSecondary
                                            }

                                            CButton {
                                                text: "Cancel"
                                                variant: "danger"
                                                size: "sm"
                                                enabled: modelData.status === "queued" || modelData.status === "processing"
                                                visible: modelData.status !== "completed" && modelData.status !== "failed"
                                                Layout.preferredWidth: 70
                                                onClicked: cancelJobById(modelData.id)
                                            }

                                            // Placeholder for completed/failed jobs
                                            Item {
                                                visible: modelData.status === "completed" || modelData.status === "failed"
                                                Layout.preferredWidth: 70
                                            }
                                        }

                                        CDivider {
                                            Layout.fillWidth: true
                                            visible: index < jobs.length - 1
                                        }
                                    }
                                }
                            }
                        }

                        Item { Layout.preferredHeight: 8 }
                    }
                }
            }

            // ══════════════════════════════════════════
            // 1 - RADIO
            // ══════════════════════════════════════════
            Rectangle {
                color: "transparent"

                RowLayout {
                    anchors.fill: parent
                    spacing: 16

                    // ── Channel List ──
                    CCard {
                        Layout.preferredWidth: 320
                        Layout.fillHeight: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 12

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 8

                                CText { variant: "h4"; text: "Radio Channels" }
                                CText { variant: "caption"; text: radioChannels.length + " channels"; color: Theme.textSecondary }
                            }

                            CDivider { Layout.fillWidth: true }

                            ListView {
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                model: radioChannels
                                spacing: 4
                                clip: true

                                delegate: CListItem {
                                    width: parent ? parent.width : 288
                                    title: modelData.name
                                    subtitle: modelData.status === "live"
                                        ? modelData.listeners + " listeners"
                                        : "Offline"
                                    selected: index === selectedRadioIndex
                                    onClicked: selectedRadioIndex = index
                                }
                            }
                        }
                    }

                    // ── Channel Detail ──
                    CCard {
                        Layout.fillWidth: true
                        Layout.fillHeight: true

                        Flickable {
                            anchors.fill: parent
                            anchors.margins: 16
                            contentHeight: radioDetailCol.implicitHeight
                            clip: true

                            ColumnLayout {
                                id: radioDetailCol
                                width: parent.width
                                spacing: 16

                                // Channel header
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    CText { variant: "h3"; text: radioChannels[selectedRadioIndex].name }
                                    CStatusBadge {
                                        status: radioChannels[selectedRadioIndex].status === "live" ? "success" : "error"
                                        text: radioChannels[selectedRadioIndex].status === "live" ? "Live" : "Offline"
                                    }

                                    Item { Layout.fillWidth: true }

                                    CButton {
                                        text: radioChannels[selectedRadioIndex].status === "live" ? "Stop Stream" : "Start Stream"
                                        variant: radioChannels[selectedRadioIndex].status === "live" ? "danger" : "primary"
                                        onClicked: toggleRadioStream(selectedRadioIndex)
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Stats row
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: 60

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 2
                                            CText { variant: "caption"; text: "Listeners" }
                                            CText { variant: "h4"; text: radioChannels[selectedRadioIndex].listeners.toString() }
                                        }
                                    }

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: 60

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 2
                                            CText { variant: "caption"; text: "Bitrate" }
                                            CText { variant: "h4"; text: radioChannels[selectedRadioIndex].bitrate }
                                        }
                                    }

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: 60

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 2
                                            CText { variant: "caption"; text: "Now Playing" }
                                            CText {
                                                variant: "body2"
                                                text: radioChannels[selectedRadioIndex].currentTrack
                                                elide: Text.ElideRight
                                                Layout.fillWidth: true
                                            }
                                        }
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Playlist
                                CText { variant: "subtitle1"; text: "Playlist" }
                                CText {
                                    variant: "caption"
                                    text: radioChannels[selectedRadioIndex].playlist.length + " tracks"
                                    color: Theme.textSecondary
                                }

                                Repeater {
                                    model: radioChannels[selectedRadioIndex].playlist

                                    delegate: FlexRow {
                                        Layout.fillWidth: true
                                        spacing: 12

                                        CText {
                                            variant: "caption"
                                            text: (index + 1).toString().padStart(2, " ") + "."
                                            font.family: "monospace"
                                            color: Theme.textSecondary
                                        }

                                        CText {
                                            variant: "body2"
                                            text: modelData
                                            Layout.fillWidth: true
                                        }

                                        CStatusBadge {
                                            visible: modelData === radioChannels[selectedRadioIndex].currentTrack
                                                && radioChannels[selectedRadioIndex].status === "live"
                                            status: "success"
                                            text: "Playing"
                                        }
                                    }
                                }

                                Item { Layout.preferredHeight: 8 }
                            }
                        }
                    }
                }
            }

            // ══════════════════════════════════════════
            // 2 - TV
            // ══════════════════════════════════════════
            Rectangle {
                color: "transparent"

                RowLayout {
                    anchors.fill: parent
                    spacing: 16

                    // ── Channel List ──
                    CCard {
                        Layout.preferredWidth: 320
                        Layout.fillHeight: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 12

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 8

                                CText { variant: "h4"; text: "TV Channels" }
                                CText { variant: "caption"; text: tvChannels.length + " channels"; color: Theme.textSecondary }
                            }

                            CDivider { Layout.fillWidth: true }

                            ListView {
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                model: tvChannels
                                spacing: 4
                                clip: true

                                delegate: CListItem {
                                    width: parent ? parent.width : 288
                                    title: modelData.name
                                    subtitle: modelData.status === "broadcasting"
                                        ? modelData.viewers + " viewers"
                                        : "Offline"
                                    selected: index === selectedTvIndex
                                    onClicked: selectedTvIndex = index
                                }
                            }
                        }
                    }

                    // ── Channel Detail ──
                    CCard {
                        Layout.fillWidth: true
                        Layout.fillHeight: true

                        Flickable {
                            anchors.fill: parent
                            anchors.margins: 16
                            contentHeight: tvDetailCol.implicitHeight
                            clip: true

                            ColumnLayout {
                                id: tvDetailCol
                                width: parent.width
                                spacing: 16

                                // Channel header
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    CText { variant: "h3"; text: tvChannels[selectedTvIndex].name }
                                    CStatusBadge {
                                        status: tvChannels[selectedTvIndex].status === "broadcasting" ? "success" : "error"
                                        text: tvChannels[selectedTvIndex].status === "broadcasting" ? "Broadcasting" : "Offline"
                                    }

                                    // Resolution badge
                                    Rectangle {
                                        width: resLabel.implicitWidth + 16
                                        height: 24
                                        radius: 4
                                        color: resolutionColor(tvChannels[selectedTvIndex].resolution)
                                        opacity: 0.15

                                        CText {
                                            id: resLabel
                                            anchors.centerIn: parent
                                            variant: "caption"
                                            text: tvChannels[selectedTvIndex].resolution
                                            color: resolutionColor(tvChannels[selectedTvIndex].resolution)
                                            font.bold: true
                                        }
                                    }

                                    Item { Layout.fillWidth: true }

                                    CButton {
                                        text: tvChannels[selectedTvIndex].status === "broadcasting" ? "Stop Broadcast" : "Start Broadcast"
                                        variant: tvChannels[selectedTvIndex].status === "broadcasting" ? "danger" : "primary"
                                        onClicked: toggleTvBroadcast(selectedTvIndex)
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Stats row
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: 60

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 2
                                            CText { variant: "caption"; text: "Viewers" }
                                            CText { variant: "h4"; text: tvChannels[selectedTvIndex].viewers.toString() }
                                        }
                                    }

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: 60

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 2
                                            CText { variant: "caption"; text: "Resolution" }
                                            CText { variant: "h4"; text: tvChannels[selectedTvIndex].resolution }
                                        }
                                    }

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: 60

                                        ColumnLayout {
                                            anchors.fill: parent
                                            anchors.margins: 10
                                            spacing: 2
                                            CText { variant: "caption"; text: "Uptime" }
                                            CText { variant: "h4"; text: tvChannels[selectedTvIndex].uptime }
                                        }
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Schedule
                                CText { variant: "subtitle1"; text: "Schedule" }
                                CText {
                                    variant: "caption"
                                    text: tvChannels[selectedTvIndex].schedule.length + " programs"
                                    color: Theme.textSecondary
                                }

                                // Schedule table header
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 8

                                    CText { variant: "caption"; text: "Time";     Layout.preferredWidth: 80 }
                                    CText { variant: "caption"; text: "Program";  Layout.fillWidth: true }
                                    CText { variant: "caption"; text: "Duration"; Layout.preferredWidth: 80 }
                                }

                                CDivider { Layout.fillWidth: true }

                                Repeater {
                                    model: tvChannels[selectedTvIndex].schedule

                                    delegate: ColumnLayout {
                                        Layout.fillWidth: true
                                        spacing: 4

                                        FlexRow {
                                            Layout.fillWidth: true
                                            spacing: 8

                                            CText {
                                                variant: "body2"
                                                text: modelData.time
                                                font.family: "monospace"
                                                font.bold: true
                                                Layout.preferredWidth: 80
                                            }

                                            CText {
                                                variant: "body2"
                                                text: modelData.program
                                                Layout.fillWidth: true
                                            }

                                            CText {
                                                variant: "caption"
                                                text: modelData.duration
                                                color: Theme.textSecondary
                                                Layout.preferredWidth: 80
                                            }
                                        }

                                        CDivider {
                                            Layout.fillWidth: true
                                            visible: index < tvChannels[selectedTvIndex].schedule.length - 1
                                        }
                                    }
                                }

                                Item { Layout.preferredHeight: 8 }
                            }
                        }
                    }
                }
            }

            // ══════════════════════════════════════════
            // 3 - PLUGINS
            // ══════════════════════════════════════════
            Rectangle {
                color: "transparent"

                ScrollView {
                    anchors.fill: parent
                    clip: true

                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CText { variant: "h3"; text: "Installed Plugins" }
                            CText { variant: "caption"; text: plugins.length + " plugins"; color: Theme.textSecondary }

                            Item { Layout.fillWidth: true }

                            CButton {
                                text: "Reload All (Dev)"
                                variant: "ghost"
                                size: "sm"
                                onClicked: {
                                    mediaService.request("POST", "/api/plugins/reload", null, null)
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // Plugin grid (2 columns)
                        GridLayout {
                            Layout.fillWidth: true
                            columns: 2
                            columnSpacing: 16
                            rowSpacing: 16

                            Repeater {
                                model: plugins

                                delegate: CCard {
                                    Layout.fillWidth: true
                                    variant: "outlined"

                                    ColumnLayout {
                                        anchors.fill: parent
                                        anchors.margins: 16
                                        spacing: 10

                                        FlexRow {
                                            Layout.fillWidth: true
                                            spacing: 8

                                            CText { variant: "subtitle1"; text: modelData.name }

                                            Item { Layout.fillWidth: true }

                                            CStatusBadge {
                                                status: modelData.status === "active" ? "success" : "warning"
                                                text: modelData.status
                                            }
                                        }

                                        CText {
                                            variant: "caption"
                                            text: "v" + modelData.version
                                            color: Theme.textSecondary
                                        }

                                        CDivider { Layout.fillWidth: true }

                                        CText { variant: "caption"; text: "Capabilities" }

                                        Flow {
                                            Layout.fillWidth: true
                                            spacing: 6

                                            Repeater {
                                                model: modelData.capabilities

                                                delegate: CChip {
                                                    text: modelData
                                                }
                                            }
                                        }

                                        FlexRow {
                                            Layout.fillWidth: true
                                            spacing: 8

                                            Item { Layout.fillWidth: true }

                                            CButton {
                                                text: "Reload"
                                                variant: "ghost"
                                                size: "sm"
                                                onClicked: {
                                                    mediaService.request("POST", "/api/plugins/" + plugins[index].name.toLowerCase() + "/reload", null, null)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Item { Layout.preferredHeight: 8 }
                    }
                }
            }
        }
    }
}
