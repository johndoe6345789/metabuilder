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

    property var channel: null

    readonly property var _ch: channel || ({
        name: "", status: "offline", listeners: 0,
        bitrate: "", currentTrack: "", playlist: []
    })

    signal toggleStream()

    Layout.fillWidth: true
    Layout.fillHeight: true

    Flickable {
        Layout.fillWidth: true
        height: detailRoot.height - 32
        contentHeight: radioDetailCol.implicitHeight
        clip: true

        ColumnLayout {
            id: radioDetailCol
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h3"; text: detailRoot._ch.name }
                CStatusBadge {
                    status: detailRoot._ch.status
                        === "live"
                        ? "success" : "error"
                    text: detailRoot._ch.status
                        === "live"
                        ? "Live" : "Offline"
                }

                Item { Layout.fillWidth: true }

                CButton {
                    text: detailRoot._ch.status
                        === "live"
                        ? "Stop Stream"
                        : "Start Stream"
                    variant: detailRoot._ch.status
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
                    value: detailRoot._ch.listeners
                        .toString()
                }
                CStatCell {
                    label: "Bitrate"
                    value: detailRoot._ch.bitrate
                }
                CStatCell {
                    label: "Now Playing"
                    value: detailRoot._ch.currentTrack
                    valueVariant: "body2"
                }
            }

            CDivider { Layout.fillWidth: true }

            MediaRadioPlaylist {
                Layout.fillWidth: true
                playlist: detailRoot._ch.playlist
                currentTrack: {
                    return detailRoot._ch.currentTrack
                }
                isLive: detailRoot._ch.status
                    === "live"
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
