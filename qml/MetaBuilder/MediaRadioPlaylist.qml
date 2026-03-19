import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    Layout.fillWidth: true
    spacing: 8

    property var playlist: []
    property string currentTrack: ""
    property bool isLive: false

    CText { variant: "subtitle1"; text: "Playlist" }
    CText {
        variant: "caption"
        text: root.playlist.length + " tracks"
        color: Theme.textSecondary
    }

    Repeater {
        model: root.playlist

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
                visible: modelData === root.currentTrack && root.isLive
                status: "success"
                text: "Playing"
            }
        }
    }
}
