import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: radioTab
    color: "transparent"

    property int selectedRadioIndex: 0
    property var radioChannels: []

    signal toggleStream(int index)

    RowLayout {
        anchors.fill: parent
        spacing: 16

        // Channel List
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

        // Channel Detail
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
                            onClicked: toggleStream(selectedRadioIndex)
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
