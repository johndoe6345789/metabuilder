import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CPaper {
    id: panel
    objectName: "view_mod_player"
    Accessible.role: Accessible.Pane
    Accessible.name: "MOD Player"
    width: 420
    implicitHeight: contentCol.implicitHeight + 32

    ColumnLayout {
        id: contentCol
        anchors.fill: parent
        anchors.margins: 16
        spacing: 14

        CText { variant: "h4"; text: "MOD Player" }
        CText {
            variant: "body2"
            text: "Play the procedural Retro Gaming MOD and watch the
                visualizer react."
        }

        FlexRow {
            spacing: 12
            CButton {
                text: ModPlayer.playing
                    ? "Replay MOD" : "Play MOD"
                variant: "primary"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: ModPlayer.playing
                    ? "Replay MOD" : "Play MOD"
                Keys.onReturnPressed:
                    ModPlayer.play(
                        "frontends/qt6/assets"
                        + "/audio/retro-gaming.mod")
                Keys.onSpacePressed:
                    ModPlayer.play(
                        "frontends/qt6/assets"
                        + "/audio/retro-gaming.mod")
                onClicked: ModPlayer.play(
                    "frontends/qt6/assets"
                    + "/audio/retro-gaming.mod")
            }
            CButton {
                text: "Stop"
                variant: "ghost"
                enabled: ModPlayer.playing
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Stop MOD playback"
                Accessible.description:
                    ModPlayer.playing
                    ? "Stop the current track"
                    : "No track playing"
                Keys.onReturnPressed:
                    if (ModPlayer.playing)
                        ModPlayer.stop()
                Keys.onSpacePressed:
                    if (ModPlayer.playing)
                        ModPlayer.stop()
                onClicked: ModPlayer.stop()
            }
        }

        CStatusBadge {
            status: ModPlayer.playing ? "success" : "info"
            text: ModPlayer.playing ? "Playing" : "Idle"
        }
    }
}
