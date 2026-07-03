import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtMultimedia

Rectangle {
    id: root
    color: "#0a0e14"
    property string selectedFile: ""
    property int    artRevision:  0

    readonly property string fileName:
        selectedFile !== "" ? selectedFile.split("/").pop() : ""
    readonly property string fileExt:
        fileName !== "" ? fileName.split(".").pop().toLowerCase() : ""
    readonly property string trackTitle: {
        var t = mp.metaData.value(MediaMetaData.Title)
        return (t && String(t) !== "") ? String(t) : root.fileName
    }
    readonly property string trackArtist: {
        var a = mp.metaData.value(MediaMetaData.ContributingArtist)
        return a ? String(a) : ""
    }
    readonly property string trackAlbum: {
        var b = mp.metaData.value(MediaMetaData.AlbumTitle)
        return b ? String(b) : ""
    }

    function fmt(ms) {
        var s = Math.floor(ms / 1000); var m = Math.floor(s / 60)
        return m + ":" + (s % 60 < 10 ? "0" : "") + (s % 60)
    }

    component TBtn : Rectangle {
        id: tb; property string txt: ""; signal act()
        width: 38; height: 38; radius: 8
        color: tbh.hovered ? "#161f2b" : "transparent"
        Text { anchors.centerIn: parent; text: tb.txt
            color: "#8b949e"; font.pixelSize: 18 }
        HoverHandler { id: tbh }
        TapHandler   { onTapped: tb.act() }
    }

    AudioOutput { id: ao; volume: volSlider.value }
    MediaPlayer {
        id: mp
        source: root.selectedFile !== "" ? "file://" + root.selectedFile : ""
        audioOutput: ao
        onMetaDataChanged: {
            artHelper.update(mp.metaData.value(MediaMetaData.ThumbnailImage))
            root.artRevision++
        }
    }

    ColumnLayout {
        anchors.fill: parent; spacing: 0

        Item {
            Layout.fillWidth: true; Layout.fillHeight: true
            RowLayout {
                anchors.centerIn: parent; spacing: 40
                width: Math.min(parent.width - 80, 620)

                Rectangle {
                    width: 196; height: 196; radius: 18
                    color: "#0f1923"
                    border.color: "#0ea5e9"; border.width: 2
                    clip: true

                    Image {
                        id: artImg; anchors.fill: parent
                        source: root.artRevision > 0
                            ? "image://albumart/current?" + root.artRevision
                            : ""
                        fillMode: Image.PreserveAspectCrop
                        visible: status === Image.Ready
                    }
                    Text {
                        anchors.centerIn: parent; text: "♪"
                        font.pixelSize: 84; color: "#0ea5e9"
                        visible: artImg.status !== Image.Ready
                        opacity: root.selectedFile !== "" ? 0.85 : 0.18
                    }
                }

                ColumnLayout {
                    Layout.fillWidth: true; spacing: 8

                    Label {
                        Layout.fillWidth: true
                        text: root.trackTitle || "No track loaded"
                        color: root.selectedFile !== "" ? "#e6edf3" : "#484f58"
                        font.pixelSize: 18; font.bold: true
                        elide: Text.ElideMiddle
                    }
                    Label {
                        visible: root.trackArtist !== ""
                        text: root.trackArtist
                        color: "#8b949e"; font.pixelSize: 13
                        elide: Text.ElideMiddle
                        Layout.fillWidth: true
                    }
                    Label {
                        visible: root.trackAlbum !== ""
                        text: root.trackAlbum
                        color: "#484f58"; font.pixelSize: 12
                        elide: Text.ElideMiddle
                        Layout.fillWidth: true
                    }

                    Row { spacing: 8
                        Rectangle {
                            visible: root.fileExt !== ""
                            width: eLbl.implicitWidth + 14; height: 22; radius: 4
                            color: "#0ea5e9"
                            Label { id: eLbl; anchors.centerIn: parent
                                text: root.fileExt.toUpperCase()
                                color: "#fff"; font.pixelSize: 11
                                font.bold: true }
                        }
                        Label {
                            text: mp.playbackState === MediaPlayer.PlayingState
                                ? "▶  Playing"
                                : mp.playbackState === MediaPlayer.PausedState
                                ? "⏸  Paused" : "■  Stopped"
                            color: mp.playbackState === MediaPlayer.PlayingState
                                ? "#0ea5e9" : "#8b949e"
                            font.pixelSize: 13; anchors.verticalCenter: parent.verticalCenter
                        }
                    }
                }
            }
        }

        ColumnLayout {
            Layout.fillWidth: true; Layout.margins: 40
            Layout.topMargin: 0; spacing: 4
            Slider {
                id: seek; Layout.fillWidth: true
                from: 0; to: Math.max(mp.duration, 1); value: mp.position
                onMoved: mp.setPosition(Math.round(value))
                background: Rectangle {
                    x: seek.leftPadding
                    y: seek.topPadding + seek.availableHeight/2 - height/2
                    width: seek.availableWidth; height: 5; radius: 3; color: "#1c2635"
                    Rectangle { width: seek.visualPosition * parent.width
                        height: parent.height; radius: 3; color: "#0ea5e9" }
                }
                handle: Rectangle {
                    x: seek.leftPadding + seek.visualPosition*(seek.availableWidth-width)
                    y: seek.topPadding + seek.availableHeight/2 - height/2
                    width: 14; height: 14; radius: 7
                    color: seek.pressed ? "#38bdf8" : "#0ea5e9"
                    border.color: "#0a0e14"; border.width: 2
                }
            }
            RowLayout {
                Layout.fillWidth: true
                Label { text: fmt(mp.position); color: "#8b949e"; font.pixelSize: 11 }
                Item  { Layout.fillWidth: true }
                Label { text: fmt(mp.duration); color: "#8b949e"; font.pixelSize: 11 }
            }
        }

        Rectangle {
            Layout.fillWidth: true; height: 64; color: "#080d14"
            RowLayout {
                anchors.centerIn: parent; spacing: 6
                TBtn { txt: "⏮"; onAct: mp.setPosition(0) }
                TBtn { txt: "⏪"; onAct: mp.setPosition(Math.max(0,mp.position-10000)) }
                Rectangle {
                    width: 54; height: 54; radius: 27
                    color: ppHov.hovered ? "#1d4ed8" : "#1e3a8a"
                    Text { anchors.centerIn: parent; font.pixelSize: 22
                        text: mp.playbackState===MediaPlayer.PlayingState ? "⏸":"▶"
                        color: "#fff" }
                    HoverHandler { id: ppHov }
                    TapHandler  { onTapped: mp.playbackState===MediaPlayer.PlayingState
                        ? mp.pause() : mp.play() }
                }
                TBtn { txt: "⏩"; onAct: mp.setPosition(Math.min(mp.duration,mp.position+10000)) }
                TBtn { txt: "⏹"; onAct: mp.stop() }
                Rectangle { width: 1; height: 36; color: "#21262d"; opacity: 0.6 }
                Text { text: volSlider.value < 0.01 ? "🔇"
                    : volSlider.value < 0.5 ? "🔉" : "🔊"
                    font.pixelSize: 16; color: "#8b949e" }
                Slider {
                    id: volSlider; from: 0; to: 1; value: 0.85
                    implicitWidth: 80; implicitHeight: 24
                    background: Rectangle {
                        x: volSlider.leftPadding
                        y: volSlider.topPadding+volSlider.availableHeight/2-height/2
                        width: volSlider.availableWidth; height: 3; radius: 2; color: "#21262d"
                        Rectangle { width: volSlider.visualPosition*parent.width
                            height: parent.height; radius: 2; color: "#8b949e" }
                    }
                    handle: Rectangle {
                        x: volSlider.leftPadding+volSlider.visualPosition*(volSlider.availableWidth-width)
                        y: volSlider.topPadding+volSlider.availableHeight/2-height/2
                        width: 10; height: 10; radius: 5; color: "#e6edf3"
                    }
                }
            }
        }
    }
}
