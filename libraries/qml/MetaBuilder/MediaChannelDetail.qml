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
        Layout.fillWidth: true
        height: channelDetail.height - 32
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
                    status: channel
                        && channel.status
                            === "broadcasting"
                        ? "success" : "error"
                    text: channel
                        && channel.status
                            === "broadcasting"
                        ? "Broadcasting" : "Offline"
                }

                Rectangle {
                    width: resLabel.implicitWidth + 16
                    height: 24
                    radius: 4
                    color: channel
                        ? resolutionColor(
                            channel.resolution)
                        : "transparent"
                    opacity: 0.15

                    CText {
                        id: resLabel
                        anchors.centerIn: parent
                        variant: "caption"
                        text: channel
                            ? channel.resolution : ""
                        color: channel
                            ? channelDetail
                                .resolutionColor(
                                    channel.resolution)
                            : Theme.textSecondary
                        font.bold: true
                    }
                }

                Item { Layout.fillWidth: true }

                CButton {
                    text: channel
                        && channel.status
                            === "broadcasting"
                        ? "Stop Broadcast"
                        : "Start Broadcast"
                    variant: channel
                        && channel.status
                            === "broadcasting"
                        ? "danger" : "primary"
                    onClicked: {
                        channelDetail.toggleBroadcast()
                    }
                }
            }

            CDivider { Layout.fillWidth: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CStatCell {
                    label: "Viewers"
                    value: channel
                        ? channel.viewers.toString()
                        : "0"
                }
                CStatCell {
                    label: "Resolution"
                    value: channel
                        ? channel.resolution : ""
                }
                CStatCell {
                    label: "Uptime"
                    value: channel
                        ? channel.uptime : ""
                }
            }

            CDivider { Layout.fillWidth: true }

            MediaChannelSchedule {
                Layout.fillWidth: true
                schedule: channel ? channel.schedule : []
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
