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

    RowLayout {
        anchors.fill: parent
        spacing: 16

        MediaChannelList {
            selectedIndex: tvTab.selectedTvIndex
            channels: tvTab.tvChannels
            onChannelSelected: function(index) { tvTab.selectedTvIndex = index }
        }

        MediaChannelDetail {
            channel: tvChannels.length > 0 ? tvChannels[selectedTvIndex] : null
            onToggleBroadcast: tvTab.toggleBroadcast(selectedTvIndex)
        }
    }
}
