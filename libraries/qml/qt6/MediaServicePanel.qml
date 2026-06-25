import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "MediaServiceCrud.js" as Crud

Rectangle {
    id: root
    color: "transparent"
    objectName: "view_media_service"
    Accessible.role: Accessible.Pane
    Accessible.name: "Media Service Panel"

    property int currentTab: 0
    property string serviceStatus: "unknown"
    property string serviceVersion: ""
    property string lastHealthCheck: ""
    property var jobs: []
    property var radioChannels: []
    property var tvChannels: []
    property var plugins: []
    property string baseUrl:
        "http://localhost:8090"

    property var tabModel: [
        { label: "Jobs" },
        { label: "Radio" },
        { label: "TV" },
        { label: "Plugins" }
    ]

    function request(method, ep, body, cb) {
        Crud.httpRequest(
            baseUrl, method, ep, body, cb)
    }

    function healthCheck() {
        serviceStatus = "unknown"
        request("GET", "/health", null,
            function(result, error) {
                if (error) {
                    serviceStatus = "offline"
                    serviceVersion = ""
                } else {
                    serviceStatus = "online"
                    serviceVersion =
                        result.version || ""
                }
                lastHealthCheck =
                    Qt.formatDateTime(
                        new Date(), "hh:mm:ss")
            })
        healthTimeout.start()
    }

    Component.onCompleted: {
        Crud.loadJson(
            "config/media-mock-data.json",
            function(data) {
                jobs = data.jobs || []
                radioChannels =
                    data.radioChannels || []
                tvChannels =
                    data.tvChannels || []
                plugins = data.plugins || []
            })
        healthCheck()
    }

    Timer {
        id: healthTimeout
        interval: 3000; repeat: false
        onTriggered: {
            if (serviceStatus === "unknown") {
                serviceStatus = "offline"
                lastHealthCheck =
                    Qt.formatDateTime(
                        new Date(), "hh:mm:ss")
            }
        }
    }
    Timer {
        interval: 30000; repeat: true
        running: true
        onTriggered: healthCheck()
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20; spacing: 16

        CMediaHeader {
            serviceStatus:
                root.serviceStatus
            serviceVersion:
                root.serviceVersion
            lastHealthCheck:
                root.lastHealthCheck
            jobCount: jobs.length
            radioCount: radioChannels.length
            tvCount: tvChannels.length
            pluginCount: plugins.length
            onRefreshClicked: healthCheck()
        }

        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged:
                currentTab = currentIndex
            tabs: tabModel
        }

        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            CMediaJobsTab {
                jobs: root.jobs
                onJobSubmitted:
                    function(type, inp,
                        out, pri) {
                    if (inp.length === 0
                        || out.length === 0)
                        return
                    request("POST",
                        "/api/jobs", {
                            type: type,
                            input: inp,
                            output: out,
                            priority: pri
                        },
                        function(result, err) {
                            if (!err && result)
                                jobs =
                                    Crud.prependJob(
                                    jobs, result,
                                    type)
                        })
                }
                onCancelRequested:
                    function(jobId) {
                    request("DELETE",
                        "/api/jobs/" + jobId,
                        null, null)
                    jobs = Crud.cancelJob(
                        jobs, jobId)
                }
            }

            MediaRadioTab {
                radioChannels:
                    root.radioChannels
                onToggleStream: function(i) {
                    radioChannels =
                        Crud.toggleRadio(
                            radioChannels, i)
                }
            }
            MediaTvTab {
                tvChannels: root.tvChannels
                onToggleBroadcast:
                    function(i) {
                    tvChannels =
                        Crud.toggleTv(
                            tvChannels, i)
                }
            }
            MediaPluginsTab {
                plugins: root.plugins
                onReloadAll: request("POST",
                    "/api/plugins/reload",
                    null, null)
                onReloadPlugin:
                    function(name) {
                    request("POST",
                        "/api/plugins/" + name
                        + "/reload", null, null)
                }
            }
        }
    }
}
