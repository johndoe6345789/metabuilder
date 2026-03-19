import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    // ── Game state ──
    property int elapsedSeconds: 0
    property bool gameActive: true
    property bool puzzleSolved: false
    property var inventory: []
    property string currentRoom: "The Antechamber"
    property string roomDescription: "You stand in a dimly lit stone chamber. Ancient symbols line the walls. A heavy iron door blocks the passage north. A dusty bookshelf leans against the east wall, and a strange brass mechanism sits on a pedestal in the center."

    property string digit1: ""
    property string digit2: ""
    property string digit3: ""
    property string digit4: ""
    property string correctCode: "7314"
    property string feedbackText: ""

    ListModel {
        id: clueLog
        ListElement { clue: "The chamber smells of old parchment and oil." }
        ListElement { clue: "You notice scratch marks near the pedestal base." }
    }

    // ── Timer ──
    Timer {
        id: gameTimer
        interval: 1000
        running: root.gameActive && !root.puzzleSolved
        repeat: true
        onTriggered: root.elapsedSeconds++
    }

    function formatTime(sec) {
        var m = Math.floor(sec / 60)
        var s = sec % 60
        return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s
    }

    function examine() {
        var clues = [
            "A faded inscription reads: 'The first digit mirrors the walls' — you count 7 symbols.",
            "Behind the bookshelf you find a torn page: '...third, the one that comes after zero...'",
            "The brass mechanism has 4 dials. One is stuck on the number 4.",
            "A scratched tally on the pedestal base shows III marks.",
            "You notice the symbols repeat in groups of seven.",
            "An old map fragment shows a path marked with the number 1."
        ]
        var c = clues[Math.floor(Math.random() * clues.length)]
        clueLog.append({ clue: c })
    }

    function lookAround() {
        var observations = [
            "The iron door has a combination lock with 4 rotating dials.",
            "Cobwebs stretch between the ceiling beams. Something glints behind one.",
            "The floor tiles are numbered, but most are worn away.",
            "A cold draft seeps from beneath the north door.",
            "The bookshelf contains old journals — one is bookmarked."
        ]
        var o = observations[Math.floor(Math.random() * observations.length)]
        clueLog.append({ clue: o })
    }

    function useItem() {
        if (inventory.length === 0) {
            feedbackText = "Your inventory is empty."
            return
        }
        clueLog.append({ clue: "You use the " + inventory[inventory.length - 1] + " but nothing happens... yet." })
    }

    function collectItem() {
        var items = ["Rusty Key", "Torn Page", "Brass Gear", "Glass Lens", "Iron Nail"]
        var available = []
        for (var i = 0; i < items.length; i++) {
            if (inventory.indexOf(items[i]) < 0) available.push(items[i])
        }
        if (available.length === 0) {
            feedbackText = "Nothing more to collect here."
            return
        }
        var item = available[Math.floor(Math.random() * available.length)]
        var inv = inventory.slice()
        inv.push(item)
        inventory = inv
        clueLog.append({ clue: "You found: " + item })
    }

    function tryCode() {
        var entered = digit1 + digit2 + digit3 + digit4
        if (entered.length < 4) {
            feedbackText = "Enter all 4 digits."
            return
        }
        if (entered === correctCode) {
            puzzleSolved = true
            feedbackText = "The lock clicks open! You escaped!"
            clueLog.append({ clue: "VICTORY! The door swings open. Time: " + formatTime(elapsedSeconds) })
        } else {
            feedbackText = "Wrong combination. Try again."
            clueLog.append({ clue: "Code " + entered + " failed. The dials reset." })
        }
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

                        CText { variant: "h2"; text: "Escape Room" }
                        CStatusBadge {
                            status: root.puzzleSolved ? "success" : "warning"
                            text: root.puzzleSolved ? "Escaped!" : "In Progress"
                        }
                        Item { Layout.fillWidth: true }

                        // Timer
                        Rectangle {
                            width: 90
                            height: 36
                            radius: 8
                            color: Theme.card
                            border.color: Theme.border
                            border.width: 1

                            CText {
                                anchors.centerIn: parent
                                variant: "h3"
                                text: formatTime(root.elapsedSeconds)
                                color: root.elapsedSeconds > 300 ? "#e74c3c" : Theme.text
                            }
                        }
                    }
                }
            }

            RowLayout {
                Layout.fillWidth: true
                spacing: 16

                // ── Left column: Room + Puzzle ──
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.preferredWidth: 400
                    spacing: 16

                    // Room description
                    CCard {
                        Layout.fillWidth: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 10

                            FlexRow {
                                spacing: 8
                                CText { variant: "subtitle1"; text: root.currentRoom }
                                CBadge { text: "Room 1 of 3" }
                            }

                            CText {
                                variant: "body1"
                                text: root.roomDescription
                                Layout.fillWidth: true
                                wrapMode: Text.WordWrap
                                font.italic: true
                                opacity: 0.85
                            }
                        }
                    }

                    // Interaction buttons
                    CCard {
                        Layout.fillWidth: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 10

                            CText { variant: "subtitle1"; text: "Actions" }

                            GridLayout {
                                Layout.fillWidth: true
                                columns: 2
                                columnSpacing: 8
                                rowSpacing: 8

                                CButton { text: "Examine"; Layout.fillWidth: true; onClicked: root.examine(); enabled: !root.puzzleSolved }
                                CButton { text: "Look Around"; Layout.fillWidth: true; onClicked: root.lookAround(); enabled: !root.puzzleSolved }
                                CButton { text: "Use Item"; Layout.fillWidth: true; variant: "ghost"; onClicked: root.useItem(); enabled: !root.puzzleSolved }
                                CButton { text: "Search Area"; Layout.fillWidth: true; variant: "ghost"; onClicked: root.collectItem(); enabled: !root.puzzleSolved }
                            }
                        }
                    }

                    // Combination lock puzzle
                    CCard {
                        Layout.fillWidth: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 12

                            CText { variant: "subtitle1"; text: "Combination Lock" }
                            CText { variant: "caption"; text: "Enter the 4-digit code to unlock the door" }

                            RowLayout {
                                Layout.alignment: Qt.AlignHCenter
                                spacing: 8

                                Repeater {
                                    model: 4

                                    TextField {
                                        Layout.preferredWidth: 50
                                        Layout.preferredHeight: 50
                                        horizontalAlignment: Text.AlignHCenter
                                        font.pixelSize: 22
                                        font.bold: true
                                        maximumLength: 1
                                        inputMethodHints: Qt.ImhDigitsOnly
                                        color: Theme.text
                                        background: Rectangle {
                                            radius: 8
                                            color: Theme.card
                                            border.color: root.puzzleSolved ? "#2ecc71" : Theme.border
                                            border.width: 2
                                        }
                                        onTextChanged: {
                                            if (index === 0) root.digit1 = text
                                            else if (index === 1) root.digit2 = text
                                            else if (index === 2) root.digit3 = text
                                            else root.digit4 = text
                                        }
                                    }
                                }
                            }

                            CButton {
                                text: root.puzzleSolved ? "Unlocked!" : "Try Combination"
                                Layout.fillWidth: true
                                enabled: !root.puzzleSolved
                                onClicked: root.tryCode()
                            }

                            CText {
                                variant: "caption"
                                text: root.feedbackText
                                color: root.puzzleSolved ? "#2ecc71" : "#e74c3c"
                                visible: root.feedbackText.length > 0
                            }
                        }
                    }
                }

                // ── Right column: Inventory + Clues ──
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.preferredWidth: 280
                    spacing: 16

                    // Inventory
                    CCard {
                        Layout.fillWidth: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 8

                            FlexRow {
                                spacing: 8
                                CText { variant: "subtitle1"; text: "Inventory" }
                                CBadge { text: root.inventory.length + " items" }
                            }

                            CDivider { Layout.fillWidth: true }

                            CText {
                                variant: "body2"
                                text: "No items collected yet."
                                visible: root.inventory.length === 0
                                opacity: 0.5
                            }

                            Repeater {
                                model: root.inventory
                                CListItem {
                                    Layout.fillWidth: true
                                    text: modelData
                                }
                            }
                        }
                    }

                    // Clue log
                    CCard {
                        Layout.fillWidth: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            spacing: 8

                            FlexRow {
                                spacing: 8
                                CText { variant: "subtitle1"; text: "Clue Log" }
                                CBadge { text: clueLog.count + " clues" }
                            }

                            CDivider { Layout.fillWidth: true }

                            Repeater {
                                model: clueLog

                                CText {
                                    variant: "caption"
                                    text: "\u2022 " + model.clue
                                    Layout.fillWidth: true
                                    wrapMode: Text.WordWrap
                                    opacity: 0.8
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
