import QtQuick 2.15
import QtQuick.Layouts 1.15
import "qmllib/Material" as Material

Material.MaterialSurface {
    id: panel
    width: 420
    height: 220
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 14

        Material.MaterialTypography { variant: "h2"; text: "MOD Player" }
        Text {
            text: "Play the procedural Retro Gaming MOD and watch the visualizer react."
            font.pixelSize: 14
            color: Material.MaterialPalette.onSurface
        }

        RowLayout {
            spacing: 12
            Material.MaterialButton {
                text: ModPlayer.playing ? "Replay MOD" : "Play MOD"
                onClicked: ModPlayer.play("frontends/qt6/assets/audio/retro-gaming.mod")
            }
            Material.MaterialButton {
                text: "Stop"
                outlined: true
                onClicked: ModPlayer.stop()
                enabled: ModPlayer.playing
            }
        }

        Text {
            text: ModPlayer.playing ? "Status: Playing" : "Status: Idle"
            font.pixelSize: 12
            color: Material.MaterialPalette.onSurface
        }
    }
}
