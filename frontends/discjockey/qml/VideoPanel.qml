import QtQuick
import QtQuick.Controls
import QtMultimedia

Item {
    id: root
    property string selectedFile: ""

    readonly property string fileName:
        selectedFile !== "" ? selectedFile.split("/").pop() : ""
    readonly property string fileExt:
        selectedFile !== "" ? selectedFile.split(".").pop().toUpperCase() : ""

    MediaPlayer {
        id: mp
        source: root.selectedFile !== "" ? "file://" + root.selectedFile : ""
        audioOutput: AudioOutput { volume: 1.0 }
        videoOutput: vout
    }

    Rectangle { anchors.fill: parent; color: "#000" }
    VideoOutput { id: vout; anchors.fill: parent }

    // Empty state
    Column {
        anchors.centerIn: parent; spacing: 8
        visible: root.selectedFile === ""
        Text { text: "▶"; font.pixelSize: 64; color: "#30363d"
            horizontalAlignment: Text.AlignHCenter; width: parent.width }
        Text { text: "No video loaded"; color: "#484f58"; font.pixelSize: 14
            horizontalAlignment: Text.AlignHCenter; width: parent.width }
    }

    // ── Top title bar (VLC style) ─────────────────────
    Rectangle {
        id: titleBar
        anchors { left: parent.left; right: parent.right; top: parent.top }
        height: 46
        color: Qt.rgba(0, 0, 0, 0.65)
        opacity: hov.containsMouse || !mp.hasVideo ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 220 } }

        Row {
            anchors { verticalCenter: parent.verticalCenter
                      left: parent.left; leftMargin: 14 }
            spacing: 8
            Rectangle {
                visible: root.selectedFile !== ""
                anchors.verticalCenter: parent.verticalCenter
                width: extTxt.implicitWidth + 10; height: 20; radius: 3
                color: "#7c3aed"
                Text { id: extTxt; anchors.centerIn: parent
                    text: root.fileExt; color: "#fff"
                    font.pixelSize: 10; font.bold: true }
            }
            Text {
                text: root.fileName; color: "#e6edf3"; font.pixelSize: 13
                anchors.verticalCenter: parent.verticalCenter
                elide: Text.ElideRight
                width: Math.min(implicitWidth, root.width - 120)
            }
        }
    }

    // ── Bottom controls ───────────────────────────────
    Rectangle {
        anchors { left: parent.left; right: parent.right; bottom: parent.bottom }
        height: 56
        color: Qt.rgba(0, 0, 0, 0.72)
        opacity: hov.containsMouse || !mp.hasVideo ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 220 } }

        PlayerControls {
            anchors { fill: parent; margins: 8 }
            playing:  mp.playbackState === MediaPlayer.PlayingState
            position: mp.position; duration: mp.duration
            onPlayPauseClicked: mp.playbackState === MediaPlayer.PlayingState
                ? mp.pause() : mp.play()
            onSeeked: pos => mp.setPosition(pos)
        }
    }

    MouseArea {
        id: hov; anchors.fill: parent; hoverEnabled: true
        onClicked: mp.playbackState === MediaPlayer.PlayingState
            ? mp.pause() : mp.play()
    }
}
