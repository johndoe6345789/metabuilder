import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: tvTab
    color: "transparent"

    property int selectedTvIndex: 0
    property var tvChannels: []

    signal toggleBroadcast(int index)

    function resolutionColor(res) {
        switch (res) {
            case "1080p": return Theme.success
            case "720p":  return Theme.warning
            case "480p":  return Theme.error
            default:      return Theme.textSecondary
        }
    }

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

        // Channel Detail
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
                            onClicked: toggleBroadcast(selectedTvIndex)
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
