import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: channelDetail

    Layout.fillWidth: true
    Layout.fillHeight: true

    property var channel: null

    signal toggleBroadcast()

    function resolutionColor(res) {
        switch (res) {
            case "1080p": return Theme.success
            case "720p":  return Theme.warning
            case "480p":  return Theme.error
            default:      return Theme.textSecondary
        }
    }

    Flickable {
        anchors.fill: parent
        anchors.margins: 16
        contentHeight: detailCol.implicitHeight
        clip: true

        ColumnLayout {
            id: detailCol
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h3"; text: channel ? channel.name : "" }
                CStatusBadge {
                    status: channel && channel.status === "broadcasting" ? "success" : "error"
                    text: channel && channel.status === "broadcasting" ? "Broadcasting" : "Offline"
                }

                Rectangle {
                    width: resLabel.implicitWidth + 16
                    height: 24
                    radius: 4
                    color: channel ? resolutionColor(channel.resolution) : "transparent"
                    opacity: 0.15

                    CText {
                        id: resLabel
                        anchors.centerIn: parent
                        variant: "caption"
                        text: channel ? channel.resolution : ""
                        color: channel ? channelDetail.resolutionColor(channel.resolution) : Theme.textSecondary
                        font.bold: true
                    }
                }

                Item { Layout.fillWidth: true }

                CButton {
                    text: channel && channel.status === "broadcasting" ? "Stop Broadcast" : "Start Broadcast"
                    variant: channel && channel.status === "broadcasting" ? "danger" : "primary"
                    onClicked: channelDetail.toggleBroadcast()
                }
            }

            CDivider { Layout.fillWidth: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CPaper {
                    Layout.fillWidth: true
                    implicitHeight: 60
                    ColumnLayout {
                        anchors.fill: parent; anchors.margins: 10; spacing: 2
                        CText { variant: "caption"; text: "Viewers" }
                        CText { variant: "h4"; text: channel ? channel.viewers.toString() : "0" }
                    }
                }

                CPaper {
                    Layout.fillWidth: true
                    implicitHeight: 60
                    ColumnLayout {
                        anchors.fill: parent; anchors.margins: 10; spacing: 2
                        CText { variant: "caption"; text: "Resolution" }
                        CText { variant: "h4"; text: channel ? channel.resolution : "" }
                    }
                }

                CPaper {
                    Layout.fillWidth: true
                    implicitHeight: 60
                    ColumnLayout {
                        anchors.fill: parent; anchors.margins: 10; spacing: 2
                        CText { variant: "caption"; text: "Uptime" }
                        CText { variant: "h4"; text: channel ? channel.uptime : "" }
                    }
                }
            }

            CDivider { Layout.fillWidth: true }

            CText { variant: "subtitle1"; text: "Schedule" }
            CText {
                variant: "caption"
                text: channel ? channel.schedule.length + " programs" : "0 programs"
                color: Theme.textSecondary
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                CText { variant: "caption"; text: "Time";     Layout.preferredWidth: 80 }
                CText { variant: "caption"; text: "Program";  Layout.fillWidth: true }
                CText { variant: "caption"; text: "Duration"; Layout.preferredWidth: 80 }
            }

            CDivider { Layout.fillWidth: true }

            Repeater {
                model: channel ? channel.schedule : []

                delegate: ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 4

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        CText {
                            variant: "body2"; text: modelData.time
                            font.family: "monospace"; font.bold: true
                            Layout.preferredWidth: 80
                        }
                        CText {
                            variant: "body2"; text: modelData.program
                            Layout.fillWidth: true
                        }
                        CText {
                            variant: "caption"; text: modelData.duration
                            color: Theme.textSecondary
                            Layout.preferredWidth: 80
                        }
                    }

                    CDivider {
                        Layout.fillWidth: true
                        visible: channel ? index < channel.schedule.length - 1 : false
                    }
                }
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
