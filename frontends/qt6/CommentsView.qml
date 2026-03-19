import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: "transparent"

    property string newCommentText: ""
    property int sortMode: 0  // 0=Newest, 1=Oldest, 2=Most Liked

    ListModel {
        id: commentsModel

        ListElement {
            commentId: 1
            username: "alice"
            initials: "AL"
            timestamp: "2026-03-18 09:42"
            body: "Just deployed the new workflow engine -- the event-driven architecture is really clean. Great work on the JSON config approach!"
            likes: 12
            liked: false
        }
        ListElement {
            commentId: 2
            username: "demo"
            initials: "DE"
            timestamp: "2026-03-18 09:15"
            body: "Has anyone tested the Redis caching layer with the read-through pattern? Seeing some impressive latency improvements."
            likes: 8
            liked: true
        }
        ListElement {
            commentId: 3
            username: "bob"
            initials: "BO"
            timestamp: "2026-03-17 22:30"
            body: "The FakeMUI component library is coming along nicely. 167 components and counting!"
            likes: 5
            liked: false
        }
        ListElement {
            commentId: 4
            username: "charlie"
            initials: "CH"
            timestamp: "2026-03-17 18:05"
            body: "Quick question: is there a recommended way to add custom seed data for a new package? The declarative JSON approach in dbal/shared/seeds/database looks straightforward."
            likes: 3
            liked: false
        }
        ListElement {
            commentId: 5
            username: "demo"
            initials: "DE"
            timestamp: "2026-03-17 14:20"
            body: "Updated the forum package schema to include threaded replies. Pull request is up for review."
            likes: 15
            liked: false
        }
        ListElement {
            commentId: 6
            username: "eve"
            initials: "EV"
            timestamp: "2026-03-16 11:00"
            body: "The Qt6 frontend is shaping up well. Love the CCard and CListItem components -- consistent styling across all views."
            likes: 7
            liked: false
        }
    }

    function addComment() {
        if (newCommentText.trim().length === 0) return
        var initials = appWindow.currentUser.substring(0, 2).toUpperCase()
        commentsModel.insert(0, {
            commentId: commentsModel.count + 1,
            username: appWindow.currentUser,
            initials: initials,
            timestamp: "Just now",
            body: newCommentText.trim(),
            likes: 0,
            liked: false
        })
        newCommentText = ""
    }

    function canDelete(commentUser) {
        return commentUser === appWindow.currentUser || appWindow.currentRole === "admin" || appWindow.currentRole === "god"
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 20

            // Header
            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText {
                    variant: "h3"
                    text: "Discussion Board"
                }

                CBadge {
                    text: commentsModel.count + " comments"
                }

                Item { Layout.fillWidth: true }

                CTabBar {
                    tabs: [
                        { label: "Newest" },
                        { label: "Oldest" },
                        { label: "Most Liked" }
                    ]
                    onCurrentIndexChanged: sortMode = currentIndex
                }
            }

            // New comment input
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    CText { variant: "subtitle1"; text: "Post a Comment" }

                    CTextField {
                        Layout.fillWidth: true
                        label: "Your comment"
                        placeholderText: "Write your thoughts..."
                        text: newCommentText
                        onTextChanged: newCommentText = text
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Post Comment"
                            variant: "primary"
                            size: "sm"
                            enabled: newCommentText.trim().length > 0
                            onClicked: addComment()
                        }
                    }
                }
            }

            // Comments list
            Repeater {
                model: commentsModel

                delegate: CCard {
                    Layout.fillWidth: true

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 20
                        spacing: 10

                        // Comment header: avatar, user, time
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CAvatar {
                                initials: model.initials
                            }

                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 2

                                FlexRow {
                                    spacing: 8
                                    CText {
                                        variant: "subtitle1"
                                        text: model.username
                                    }
                                    CChip {
                                        text: model.username === appWindow.currentUser ? "You" : ""
                                        visible: model.username === appWindow.currentUser
                                    }
                                }

                                CText {
                                    variant: "caption"
                                    text: model.timestamp
                                }
                            }
                        }

                        // Comment body
                        CText {
                            Layout.fillWidth: true
                            variant: "body1"
                            text: model.body
                            wrapMode: Text.WordWrap
                        }

                        CDivider { Layout.fillWidth: true }

                        // Actions row
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            CButton {
                                text: model.liked ? "Liked (" + model.likes + ")" : "Like (" + model.likes + ")"
                                variant: model.liked ? "primary" : "ghost"
                                size: "sm"
                                onClicked: {
                                    if (model.liked) {
                                        commentsModel.setProperty(index, "likes", model.likes - 1)
                                        commentsModel.setProperty(index, "liked", false)
                                    } else {
                                        commentsModel.setProperty(index, "likes", model.likes + 1)
                                        commentsModel.setProperty(index, "liked", true)
                                    }
                                }
                            }

                            Item { Layout.fillWidth: true }

                            CButton {
                                text: "Delete"
                                variant: "danger"
                                size: "sm"
                                visible: canDelete(model.username)
                                onClicked: commentsModel.remove(index)
                            }
                        }
                    }
                }
            }

            // Empty state
            CCard {
                Layout.fillWidth: true
                visible: commentsModel.count === 0

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 40
                    spacing: 12

                    CText {
                        Layout.alignment: Qt.AlignHCenter
                        variant: "h4"
                        text: "No comments yet"
                    }
                    CText {
                        Layout.alignment: Qt.AlignHCenter
                        variant: "body2"
                        text: "Be the first to start the discussion!"
                    }
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 20 }
        }
    }
}
