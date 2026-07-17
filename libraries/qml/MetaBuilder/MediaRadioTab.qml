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
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 12

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CText { variant: "h4"; text: "Radio Channels" }
                    CText { variant: "caption"
                    text: radioChannels.length + " channels"
                    color: Theme.textSecondary }
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
        MediaRadioDetail {
            channel: radioChannels[selectedRadioIndex]
            onToggleStream: radioTab.toggleStream(selectedRadioIndex)
        }
    }
}
