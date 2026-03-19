import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder" as Meta

Rectangle {
    color: "transparent"

    DBALProvider { id: dbal }

    property int sortMode: 0

    function loadJson(path) {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(path), false)
        xhr.send()
        return xhr.status === 200 ? JSON.parse(xhr.responseText) : null
    }

    function loadMockComments() {
        var data = loadJson("config/comments-mock.json")
        if (!data) return
        for (var i = 0; i < data.length; i++) commentsModel.append(data[i])
    }

    function loadComments() {
        dbal.list("comment", { take: 50 }, function(result, error) {
            if (result && result.items && result.items.length > 0) {
                commentsModel.clear()
                for (var i = 0; i < result.items.length; i++) {
                    var c = result.items[i]
                    commentsModel.append({
                        commentId: c.id || (i + 1),
                        username: c.username || c.author || "unknown",
                        initials: (c.username || c.author || "??").substring(0, 2).toUpperCase(),
                        timestamp: c.timestamp || c.createdAt || "Unknown",
                        body: c.body || c.text || "",
                        likes: c.likes || 0,
                        liked: false
                    })
                }
            }
        })
    }

    function postCommentToDBAL(text) {
        dbal.create("comment", { text: text, author: appWindow.currentUser, username: appWindow.currentUser }, function(result, error) {
            if (error) console.warn("Failed to post comment to DBAL:", error)
        })
    }

    function likeCommentOnDBAL(commentId, newLikes) {
        dbal.update("comment", commentId, { likes: newLikes }, function(result, error) {
            if (error) console.warn("Failed to update like on DBAL:", error)
        })
    }

    function deleteCommentOnDBAL(commentId) {
        dbal.remove("comment", commentId, function(result, error) {
            if (error) console.warn("Failed to delete comment on DBAL:", error)
        })
    }

    Component.onCompleted: {
        loadMockComments()
        dbal.ping(function(success) { if (success) loadComments() })
    }

    ListModel { id: commentsModel }

    function addComment(text) {
        if (text.length === 0) return
        commentsModel.insert(0, {
            commentId: commentsModel.count + 1,
            username: appWindow.currentUser,
            initials: appWindow.currentUser.substring(0, 2).toUpperCase(),
            timestamp: "Just now", body: text, likes: 0, liked: false
        })
        postCommentToDBAL(text)
    }

    function canDelete(commentUser) {
        return commentUser === appWindow.currentUser || appWindow.currentRole === "admin" || appWindow.currentRole === "god"
    }

    ScrollView {
        anchors.fill: parent; anchors.margins: 24; clip: true

        ColumnLayout {
            width: parent.width; spacing: 20

            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CText { variant: "h3"; text: "Discussion Board" }
                CBadge { text: commentsModel.count + " comments"; badgeColor: Theme.info }
                Item { Layout.fillWidth: true }
                CTabBar {
                    tabs: [{ label: "Newest" }, { label: "Oldest" }, { label: "Most Liked" }]
                    onCurrentIndexChanged: sortMode = currentIndex
                }
            }

            Meta.CCommentInput { onSubmit: function(text) { addComment(text) } }

            Repeater {
                model: commentsModel
                delegate: Meta.CCommentCard {
                    comment: ({
                        username: model.username, initials: model.initials,
                        timestamp: model.timestamp, body: model.body,
                        likes: model.likes, liked: model.liked,
                        canDelete: canDelete(model.username)
                    })
                    currentUser: appWindow.currentUser
                    onLiked: {
                        var newLikes = model.liked ? model.likes - 1 : model.likes + 1
                        commentsModel.setProperty(index, "likes", newLikes)
                        commentsModel.setProperty(index, "liked", !model.liked)
                        likeCommentOnDBAL(model.commentId, newLikes)
                    }
                    onDeleted: { deleteCommentOnDBAL(model.commentId); commentsModel.remove(index) }
                }
            }

            CCard {
                Layout.fillWidth: true; visible: commentsModel.count === 0
                Item { Layout.preferredHeight: 24 }
                CText { Layout.fillWidth: true; variant: "h4"; text: "No comments yet"; horizontalAlignment: Text.AlignHCenter }
                CText { Layout.fillWidth: true; variant: "body2"; text: "Be the first to start the discussion!"; horizontalAlignment: Text.AlignHCenter }
                Item { Layout.preferredHeight: 24 }
            }

            Item { Layout.preferredHeight: 20 }
        }
    }
}
