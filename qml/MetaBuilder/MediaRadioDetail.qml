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
                    status: detailRoot.channel.status === "live" ? "success" : "error"
                    text: detailRoot.channel.status === "live" ? "Live" : "Offline"
                }

                Item { Layout.fillWidth: true }

                CButton {
                    text: detailRoot.channel.status === "live" ? "Stop Stream" : "Start Stream"
                    variant: detailRoot.channel.status === "live" ? "danger" : "primary"
                    onClicked: detailRoot.toggleStream()
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
                        CText { variant: "h4"; text: detailRoot.channel.listeners.toString() }
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
                        CText { variant: "h4"; text: detailRoot.channel.bitrate }
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
                            text: detailRoot.channel.currentTrack
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
                text: detailRoot.channel.playlist.length + " tracks"
                color: Theme.textSecondary
            }

            Repeater {
                model: detailRoot.channel.playlist

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
                        visible: modelData === detailRoot.channel.currentTrack
                            && detailRoot.channel.status === "live"
                        status: "success"
                        text: "Playing"
                    }
                }
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}
