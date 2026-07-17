import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

// Transport bar: position slider + time + play/pause.
RowLayout {
    id: root
    spacing: 8

    required property bool  playing
    required property int   position  // ms
    required property int   duration  // ms

    signal playPauseClicked()
    signal seeked(int posMs)

    Button {
        implicitWidth:  32
        implicitHeight: 32
        onClicked: root.playPauseClicked()
        contentItem: Text {
            text: root.playing ? "⏸" : "▶"
            color: "#e6edf3"
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment:   Text.AlignVCenter
            font.pixelSize: 14
        }
        background: Rectangle {
            color: parent.hovered ? "#30363d" : "#21262d"
            radius: 4
        }
    }

    Slider {
        id: scrub
        Layout.fillWidth: true
        from:     0
        to:       Math.max(root.duration, 1)
        value:    root.position
        onMoved:  root.seeked(Math.round(value))
        background: Rectangle {
            x: scrub.leftPadding
            y: scrub.topPadding + scrub.availableHeight / 2 - height / 2
            width:  scrub.availableWidth
            height: 4
            radius: 2
            color:  "#30363d"
            Rectangle {
                width:  scrub.visualPosition * parent.width
                height: parent.height
                radius: 2
                color:  "#7c3aed"
            }
        }
        handle: Rectangle {
            x: scrub.leftPadding + scrub.visualPosition
               * (scrub.availableWidth - width)
            y: scrub.topPadding + scrub.availableHeight / 2 - height / 2
            width: 12; height: 12; radius: 6
            color: "#7c3aed"
        }
    }

    Label {
        text: {
            function fmt(ms) {
                let s = Math.floor(ms / 1000)
                let m = Math.floor(s / 60)
                return m + ":" + String(s % 60).padStart(2, "0")
            }
            return fmt(root.position) + " / " + fmt(root.duration)
        }
        color: "#8b949e"; font.pixelSize: 11
        Layout.preferredWidth: 80
    }
}
