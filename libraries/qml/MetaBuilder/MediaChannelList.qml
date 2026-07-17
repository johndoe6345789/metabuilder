import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: channelList

    Layout.preferredWidth: 320
    Layout.fillHeight: true

    property int selectedIndex: 0
    property var channels: []

    signal channelSelected(int index)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText { variant: "h4"; text: "TV Channels" }
            CText { variant: "caption"; text: channels.length + " channels"
            color: Theme.textSecondary }
        }

        CDivider { Layout.fillWidth: true }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: channels
            spacing: 4
            clip: true

            delegate: CListItem {
                width: parent ? parent.width : 288
                title: modelData.name
                subtitle: modelData.status === "broadcasting"
                    ? modelData.viewers + " viewers"
                    : "Offline"
                selected: index === channelList.selectedIndex
                onClicked: channelList.channelSelected(index)
            }
        }
    }
}
