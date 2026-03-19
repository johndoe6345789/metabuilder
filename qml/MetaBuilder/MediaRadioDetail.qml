import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * MediaRadioDetail.qml - Channel detail panel for radio tab
 *
 * Usage:
 *   MediaRadioDetail {
 *       channel: radioChannels[selectedIndex]
 *       onToggleStream: { ... }
 *   }
 */
CCard {
    id: detailRoot

    property var channel: ({
        name: "", status: "offline", listeners: 0,
        bitrate: "", currentTrack: "", playlist: []
    })

    signal toggleStream()

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

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h3"; text: detailRoot.channel.name }
                CStatusBadge {
                    status: detailRoot.channel.status
                        === "live"
                        ? "success" : "error"
                    text: detailRoot.channel.status
                        === "live"
                        ? "Live" : "Offline"
                }

                Item { Layout.fillWidth: true }

                CButton {
                    text: detailRoot.channel.status
                        === "live"
                        ? "Stop Stream"
                        : "Start Stream"
                    variant: detailRoot.channel.status
                        === "live"
                        ? "danger" : "primary"
                    onClicked: detailRoot.toggleStream()
                }
            }

            CDivider { Layout.fillWidth: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CStatCell {
                    label: "Listeners"
                    value: detailRoot.channel
                        .listeners.toString()
                }
                CStatCell {
                    label: "Bitrate"
                    value: detailRoot.channel.bitrate
                }
                CStatCell {
                    label: "Now Playing"
                    value: detailRoot.channel.currentTrack
                    valueVariant: "body2"
                }
            }

            CDivider { Layout.fillWidth: true }

            MediaRadioPlaylist {
                Layout.fillWidth: true
                playlist: detailRoot.channel.playlist
                currentTrack: {
                    return detailRoot.channel.currentTrack
                }
                isLive: detailRoot.channel.status
                    === "live"
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
