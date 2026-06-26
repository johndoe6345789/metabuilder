import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    property string composeText: ""
    property int maxChars: 280
    property string sortMode: "Recent"
    property var sortOptions: ["Recent", "Popular", "Following"]

    ListModel {
        id: postsModel

        ListElement {
            postId: 1; username: "alice_dev"; initials: "AL"; avatarColor: "#3498db"
            timestamp: "2026-03-19 08:30"
            body: "Just shipped the new workflow engine with event-driven architecture. JSON config is the way forward!"
            likes: 24; replies: 5; liked: false; following: true
        }
        ListElement {
            postId: 2; username: "bob_ops"; initials: "BO"; avatarColor: "#e67e22"
            timestamp: "2026-03-19 07:15"
            body: "Redis caching layer benchmarks are in: 3ms avg response time with read-through pattern. Production ready."
            likes: 18; replies: 3; liked: true; following: true
        }
        ListElement {
            postId: 3; username: "charlie_ui"; initials: "CH"; avatarColor: "#2ecc71"
            timestamp: "2026-03-18 22:45"
            body: "M3 hit 167 components today. Next milestone: full parity with Material UI core set."
            likes: 31; replies: 8; liked: false; following: false
        }
        ListElement {
            postId: 4; username: "diana_sec"; initials: "DI"; avatarColor: "#9b59b6"
            timestamp: "2026-03-18 19:00"
            body: "Security audit complete. All endpoints now enforce multi-tenant filtering. No exceptions."
            likes: 42; replies: 2; liked: false; following: true
        }
        ListElement {
            postId: 5; username: "eve_data"; initials: "EV"; avatarColor: "#e74c3c"
            timestamp: "2026-03-18 16:20"
            body: "14 database backends and counting. SurrealDB adapter just passed all CRUD tests."
            likes: 15; replies: 6; liked: false; following: false
        }
        ListElement {
            postId: 6; username: "frank_ml"; initials: "FR"; avatarColor: "#1abc9c"
            timestamp: "2026-03-18 14:00"
            body: "Working on the Mojo compiler integration. Hot reload is surprisingly smooth with the new bridge."
            likes: 9; replies: 1; liked: false; following: false
        }
    }

    function toggleLike(index) {
        var item = postsModel.get(index)
        postsModel.setProperty(index, "liked", !item.liked)
        postsModel.setProperty(index, "likes", item.liked ? item.likes - 1 : item.likes + 1)
    }

    function submitPost() {
        if (composeText.length === 0 || composeText.length > maxChars) return
        postsModel.insert(0, {
            postId: postsModel.count + 1,
            username: "demo_user",
            initials: "DE",
            avatarColor: Theme.primary,
            timestamp: "2026-03-19 08:35",
            body: composeText,
            likes: 0,
            replies: 0,
            liked: false,
            following: false
        })
        composeText = ""
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

                        CText { variant: "h2"; text: "MicroThread" }
                        CBadge { text: postsModel.count + " Posts" }
                        Item { Layout.fillWidth: true }
                        CStatusBadge { status: "success"; text: "Live Feed" }
                    }
                }
            }

            // ── Compose area ──
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 10

                    CText { variant: "subtitle1"; text: "What's happening?" }

                    CTextField {
                        id: composeField
                        Layout.fillWidth: true
                        placeholderText: "Share your thoughts..."
                        text: root.composeText
                        onTextChanged: root.composeText = text
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        CText {
                            variant: "caption"
                            text: root.composeText.length + " / " + root.maxChars
                            color: root.composeText.length > root.maxChars ? "#e74c3c" : Theme.text
                            opacity: root.composeText.length > root.maxChars ? 1.0 : 0.6
                        }

                        Item { Layout.fillWidth: true }

                        CButton {
                            text: "Post"
                            enabled: root.composeText.length > 0 && root.composeText.length <= root.maxChars
                            onClicked: root.submitPost()
                        }
                    }
                }
            }

            // ── Sort chips ──
            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                CText { variant: "caption"; text: "Sort by:" }

                Repeater {
                    model: root.sortOptions
                    CChip {
                        text: modelData
                        selected: root.sortMode === modelData
                        onClicked: root.sortMode = modelData
                    }
                }
            }

            // ── Thread feed ──
            Repeater {
                model: postsModel

                CCard {
                    Layout.fillWidth: true

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 10

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            // Avatar circle
                            Rectangle {
                                width: 40
                                height: 40
                                radius: 20
                                color: model.avatarColor

                                CText {
                                    anchors.centerIn: parent
                                    variant: "caption"
                                    text: model.initials
                                    color: "#ffffff"
                                    font.bold: true
                                }
                            }

                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 2

                                FlexRow {
                                    spacing: 8
                                    CText { variant: "subtitle1"; text: "@" + model.username }
                                    CText { variant: "caption"; text: model.timestamp; opacity: 0.5 }
                                }
                            }

                            Item { Layout.fillWidth: true }

                            CBadge {
                                text: "Following"
                                accent: true
                                visible: model.following
                            }
                        }

                        CText {
                            variant: "body1"
                            text: model.body
                            Layout.fillWidth: true
                            wrapMode: Text.WordWrap
                        }

                        CDivider { Layout.fillWidth: true }

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 16

                            CButton {
                                text: (model.liked ? "\u2665 " : "\u2661 ") + model.likes
                                variant: "ghost"
                                size: "sm"
                                onClicked: root.toggleLike(index)
                            }

                            CButton {
                                text: "\uD83D\uDCAC " + model.replies
                                variant: "ghost"
                                size: "sm"
                            }

                            Item { Layout.fillWidth: true }

                            CButton {
                                text: "Share"
                                variant: "ghost"
                                size: "sm"
                            }
                        }
                    }
                }
            }
        }
    }
}
