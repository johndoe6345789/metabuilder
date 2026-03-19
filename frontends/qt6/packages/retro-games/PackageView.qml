import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    property var games: [
        { name: "Snake",          color: "#2ecc71", highScore: 4250,  implemented: true,  icon: "\u2588\u2588\u2588" },
        { name: "Breakout",       color: "#3498db", highScore: 3800,  implemented: true,  icon: "\u2580\u2580\u2580" },
        { name: "Tetris",         color: "#9b59b6", highScore: 12400, implemented: true,  icon: "\u2587\u2587\u2587" },
        { name: "Pong",           color: "#e67e22", highScore: 2100,  implemented: true,  icon: "\u2503 \u25CF \u2503" },
        { name: "Space Invaders", color: "#e74c3c", highScore: 8900,  implemented: false, icon: "\u25BD\u25BD\u25BD" },
        { name: "Pac-Man",        color: "#f1c40f", highScore: 6750,  implemented: false, icon: "\u25D0 \u00B7\u00B7" }
    ]

    property var leaderboard: [
        { rank: 1, player: "alice_dev",   game: "Tetris",   score: 12400 },
        { rank: 2, player: "bob_ops",     game: "Space Invaders", score: 8900 },
        { rank: 3, player: "charlie_ui",  game: "Pac-Man",  score: 6750 },
        { rank: 4, player: "demo_user",   game: "Snake",    score: 4250 },
        { rank: 5, player: "diana_sec",   game: "Breakout", score: 3800 }
    ]

    function launchGame(gameName) {
        console.log("Launching: " + gameName)
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 20
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 16

            // ── Header ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CText { variant: "h2"; text: "Retro Arcade" }
                        CBadge { text: root.games.length + " Games" }
                        Item { Layout.fillWidth: true }
                        CStatusBadge { status: "success"; text: "Arcade Open" }
                    }

                    CText {
                        variant: "body2"
                        text: "Pixel-perfect retro games to keep you entertained. Select a game to play!"
                        opacity: 0.7
                    }
                }
            }

            // ── Game Grid ──
            GridLayout {
                Layout.fillWidth: true
                columns: 3
                columnSpacing: 12
                rowSpacing: 12

                Repeater {
                    model: root.games

                    CCard {
                        Layout.fillWidth: true
                        Layout.preferredWidth: 200
                        Layout.preferredHeight: 250

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 10

                            // Pixel art placeholder
                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 80
                                radius: 8
                                color: modelData.color
                                opacity: modelData.implemented ? 0.9 : 0.4

                                CText {
                                    anchors.centerIn: parent
                                    text: modelData.icon
                                    font.pixelSize: 24
                                    font.family: "monospace"
                                    color: "#ffffff"
                                }

                                // Coming Soon overlay
                                Rectangle {
                                    anchors.fill: parent
                                    radius: 8
                                    color: "#000000"
                                    opacity: modelData.implemented ? 0 : 0.5
                                    visible: !modelData.implemented
                                }

                                CBadge {
                                    anchors.top: parent.top
                                    anchors.right: parent.right
                                    anchors.margins: 6
                                    text: "Coming Soon"
                                    visible: !modelData.implemented
                                }
                            }

                            CText {
                                variant: "subtitle1"
                                text: modelData.name
                                Layout.fillWidth: true
                            }

                            FlexRow {
                                Layout.fillWidth: true
                                spacing: 6

                                CText { variant: "caption"; text: "High Score:" }
                                CText {
                                    variant: "caption"
                                    text: modelData.highScore.toLocaleString()
                                    color: Theme.primary
                                    font.bold: true
                                }
                            }

                            Item { Layout.fillHeight: true }

                            CButton {
                                text: modelData.implemented ? "Play" : "Coming Soon"
                                Layout.fillWidth: true
                                enabled: modelData.implemented
                                onClicked: root.launchGame(modelData.name)
                            }
                        }
                    }
                }
            }

            // ── Leaderboard ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText { variant: "h3"; text: "Leaderboard" }
                        CBadge { text: "Top 5" }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Header row
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        CText { variant: "caption"; text: "Rank"; Layout.preferredWidth: 50; font.bold: true }
                        CText { variant: "caption"; text: "Player"; Layout.fillWidth: true; font.bold: true }
                        CText { variant: "caption"; text: "Game"; Layout.preferredWidth: 140; font.bold: true }
                        CText { variant: "caption"; text: "Score"; Layout.preferredWidth: 80; font.bold: true; horizontalAlignment: Text.AlignRight }
                    }

                    Repeater {
                        model: root.leaderboard

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            // Rank medal
                            Rectangle {
                                width: 28
                                height: 28
                                radius: 14
                                Layout.preferredWidth: 50
                                color: modelData.rank === 1 ? "#f1c40f" : modelData.rank === 2 ? "#bdc3c7" : modelData.rank === 3 ? "#cd7f32" : "transparent"
                                border.color: Theme.border
                                border.width: modelData.rank > 3 ? 1 : 0

                                CText {
                                    anchors.centerIn: parent
                                    variant: "caption"
                                    text: "#" + modelData.rank
                                    font.bold: true
                                    color: modelData.rank <= 3 ? "#ffffff" : Theme.text
                                }
                            }

                            CText { variant: "body2"; text: modelData.player; Layout.fillWidth: true }
                            CText { variant: "body2"; text: modelData.game; Layout.preferredWidth: 140 }
                            CText {
                                variant: "body2"
                                text: modelData.score.toLocaleString()
                                Layout.preferredWidth: 80
                                horizontalAlignment: Text.AlignRight
                                font.bold: true
                                color: Theme.primary
                            }
                        }
                    }
                }
            }
        }
    }
}
