import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtMultimedia

// Built-in preview player. Shows video inline or waveform for audio.
// source must be a URL string (file:/// or http://).
ColumnLayout {
    id: root
    spacing: 0

    property string source:  ""
    property bool   isVideo: false

    MediaPlayer {
        id: mp
        source: root.source !== "" ? root.source : ""
        audioOutput: AudioOutput { volume: 1.0 }
        videoOutput: root.isVideo ? vout : null
    }

    // Video area / audio placeholder
    Rectangle {
        Layout.fillWidth: true
        Layout.fillHeight: true
        color: "#000"
        clip: true

        VideoOutput {
            id: vout
            anchors.fill: parent
            visible: root.isVideo && root.source !== ""
        }

        // Audio placeholder — shown when audio-only or no file
        ColumnLayout {
            visible: !root.isVideo || root.source === ""
            anchors.centerIn: parent
            spacing: 10

            Rectangle {
                Layout.alignment: Qt.AlignHCenter
                width: 56; height: 56; radius: 14
                color: root.source !== ""
                    ? Qt.rgba(0.49, 0.23, 0.93, 0.12)
                    : Qt.rgba(0.18, 0.21, 0.27, 1)
                border.color: root.source !== "" ? "#7c3aed" : "#30363d"
                border.width: 2
                Text {
                    anchors.centerIn: parent
                    text: root.source !== "" ? "♪" : "♫"
                    color: root.source !== "" ? "#7c3aed" : "#484f58"
                    font.pixelSize: 24; font.bold: true
                }
            }
            Label {
                text: root.source !== ""
                    ? (mp.playbackState === MediaPlayer.PlayingState
                        ? "Playing" : "Paused")
                    : "No file selected"
                color: root.source !== "" ? "#e6edf3" : "#484f58"
                font.pixelSize: 13
                Layout.alignment: Qt.AlignHCenter
            }
        }
    }

    // Transport bar
    Rectangle {
        Layout.fillWidth: true
        height: 44
        color: "#161b22"
        border.color: "#30363d"; border.width: 1

        PlayerControls {
            anchors { fill: parent; margins: 6 }
            playing:  mp.playbackState === MediaPlayer.PlayingState
            position: mp.position
            duration: mp.duration
            onPlayPauseClicked: mp.playbackState === MediaPlayer.PlayingState
                ? mp.pause() : mp.play()
            onSeeked: pos => mp.setPosition(pos)
        }
    }
}
