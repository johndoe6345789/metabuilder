import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder" as Meta

Rectangle {
    color: "transparent"

    // ── DBAL connection ──
    DBALProvider { id: dbal }

    property int sortMode: 0  // 0=Newest, 1=Oldest, 2=Most Liked

    // ── DBAL data loading ──
    function loadComments() {
        dbal.list("comment", { take: 50 }, function(result, error) {
            if (result && result.items && result.items.length > 0) {
                commentsModel.clear();
                for (var i = 0; i < result.items.length; i++) {
                    var c = result.items[i];
                    commentsModel.append({
                        commentId: c.id || (i + 1),
                        username: c.username || c.author || "unknown",
                        initials: (c.username || c.author || "??").substring(0, 2).toUpperCase(),
                        timestamp: c.timestamp || c.createdAt || "Unknown",
                        body: c.body || c.text || "",
                        likes: c.likes || 0,
                        liked: false
                    });
                }
            }
            // On error or empty result, keep existing mock data
        });
    }

    function postCommentToDBAL(text) {
        var commentData = {
            text: text,
            author: appWindow.currentUser,
            username: appWindow.currentUser
        };
        dbal.create("comment", commentData, function(result, error) {
            if (error) {
                console.warn("Failed to post comment to DBAL:", error);
            }
            // Comment is already added locally via addComment()
        });
    }

    function likeCommentOnDBAL(commentId, newLikes) {
        dbal.update("comment", commentId, { likes: newLikes }, function(result, error) {
            if (error) console.warn("Failed to update like on DBAL:", error);
        });
    }

    function deleteCommentOnDBAL(commentId) {
        dbal.remove("comment", commentId, function(result, error) {
            if (error) console.warn("Failed to delete comment on DBAL:", error);
        });
    }

    Component.onCompleted: {
        dbal.ping(function(success) {
            if (success) loadComments();
        });
    }

    ListModel {
        id: commentsModel

        ListElement {
            commentId: 1; username: "alice"; initials: "AL"
            timestamp: "2026-03-18 09:42"
            body: "Just deployed the new workflow engine -- the event-driven architecture is really clean. Great work on the JSON config approach!"
            likes: 12; liked: false
        }
        ListElement {
            commentId: 2; username: "demo"; initials: "DE"
            timestamp: "2026-03-18 09:15"
            body: "Has anyone tested the Redis caching layer with the read-through pattern? Seeing some impressive latency improvements."
            likes: 8; liked: true
        }
        ListElement {
            commentId: 3; username: "bob"; initials: "BO"
            timestamp: "2026-03-17 22:30"
            body: "The FakeMUI component library is coming along nicely. 167 components and counting!"
            likes: 5; liked: false
        }
        ListElement {
            commentId: 4; username: "charlie"; initials: "CH"
            timestamp: "2026-03-17 18:05"
            body: "Quick question: is there a recommended way to add custom seed data for a new package? The declarative JSON approach in dbal/shared/seeds/database looks straightforward."
            likes: 3; liked: false
        }
        ListElement {
            commentId: 5; username: "demo"; initials: "DE"
            timestamp: "2026-03-17 14:20"
            body: "Updated the forum package schema to include threaded replies. Pull request is up for review."
            likes: 15; liked: false
        }
        ListElement {
            commentId: 6; username: "eve"; initials: "EV"
            timestamp: "2026-03-16 11:00"
            body: "The Qt6 frontend is shaping up well. Love the CCard and CListItem components -- consistent styling across all views."
            likes: 7; liked: false
        }
    }

    function addComment(text) {
        if (text.length === 0) return
        var initials = appWindow.currentUser.substring(0, 2).toUpperCase()
        commentsModel.insert(0, {
            commentId: commentsModel.count + 1,
            username: appWindow.currentUser,
            initials: initials,
            timestamp: "Just now",
            body: text,
            likes: 0,
            liked: false
        })
        postCommentToDBAL(text)
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
                    badgeColor: Theme.info
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
            Meta.CCommentInput {
                onSubmit: function(text) { addComment(text) }
            }

            // Comments list
            Repeater {
                model: commentsModel

                delegate: Meta.CCommentCard {
                    comment: ({
                        username: model.username,
                        initials: model.initials,
                        timestamp: model.timestamp,
                        body: model.body,
                        likes: model.likes,
                        liked: model.liked,
                        canDelete: canDelete(model.username)
                    })
                    currentUser: appWindow.currentUser

                    onLiked: {
                        var newLikes;
                        if (model.liked) {
                            newLikes = model.likes - 1;
                            commentsModel.setProperty(index, "likes", newLikes)
                            commentsModel.setProperty(index, "liked", false)
                        } else {
                            newLikes = model.likes + 1;
                            commentsModel.setProperty(index, "likes", newLikes)
                            commentsModel.setProperty(index, "liked", true)
                        }
                        likeCommentOnDBAL(model.commentId, newLikes)
                    }

                    onDeleted: {
                        deleteCommentOnDBAL(model.commentId)
                        commentsModel.remove(index)
                    }
                }
            }

            // Empty state
            CCard {
                Layout.fillWidth: true
                visible: commentsModel.count === 0

                Item { Layout.preferredHeight: 24 }

                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "No comments yet"
                    horizontalAlignment: Text.AlignHCenter
                }
                CText {
                    Layout.fillWidth: true
                    variant: "body2"
                    text: "Be the first to start the discussion!"
                    horizontalAlignment: Text.AlignHCenter
                }

                Item { Layout.preferredHeight: 24 }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 20 }
        }
    }
}
