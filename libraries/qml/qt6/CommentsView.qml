import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder" as Meta
import "CommentsDBAL.js" as DBAL

Rectangle {
    id: commentsRoot
    color: "transparent"
    objectName: "view_comments"
    Accessible.role: Accessible.Pane
    Accessible.name: "Discussion Board"

    DBALProvider { id: dbal }
    property int sortMode: 0
    ListModel { id: commentsModel }

    function addComment(text) {
        if (text.length === 0) return
        commentsModel.insert(0, {
            commentId: commentsModel.count + 1,
            username: appWindow.currentUser,
            initials: appWindow.currentUser
                .substring(0, 2).toUpperCase(),
            timestamp: "Just now",
            body: text, likes: 0, liked: false
        })
        DBAL.postComment(
            dbal, text, appWindow.currentUser
        )
    }

    function canDelete(commentUser) {
        return commentUser === appWindow.currentUser
            || appWindow.currentRole === "admin"
            || appWindow.currentRole === "god"
    }

    Component.onCompleted: {
        DBAL.loadMockComments(commentsModel)
        dbal.ping(function(success) {
            if (success)
                DBAL.loadComments(dbal, commentsModel)
        })
    }

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24; clip: true

        ColumnLayout {
            width: parent.width; spacing: 20

            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CText {
                    variant: "h3"
                    text: "Discussion Board"
                }
                CBadge {
                    text: commentsModel.count
                        + " comments"
                    badgeColor: Theme.info
                }
                Item { Layout.fillWidth: true }
                CTabBar {
                    tabs: [
                        { label: "Newest" },
                        { label: "Oldest" },
                        { label: "Most Liked" }
                    ]
                    activeFocusOnTab: true
                    Accessible.role: Accessible.PageTabList
                    Accessible.name: "Sort comments by"
                    onCurrentIndexChanged:
                        sortMode = currentIndex
                }
            }

            Meta.CCommentInput {
                onSubmit: function(text) {
                    addComment(text)
                }
            }

            Repeater {
                model: commentsModel
                delegate: Meta.CCommentCard {
                    required property int index
                    readonly property var _item:
                        commentsModel.get(index)
                    comment: _item ? ({
                        username: _item.username,
                        initials: _item.initials,
                        timestamp: _item.timestamp,
                        body: _item.body,
                        likes: _item.likes,
                        liked: _item.liked,
                        canDelete:
                            canDelete(_item.username)
                    }) : null
                    currentUser:
                        appWindow.currentUser
                    onLiked: {
                        var item = commentsModel.get(
                            index)
                        if (!item) return
                        var newLikes = item.liked
                            ? item.likes - 1
                            : item.likes + 1
                        commentsModel.setProperty(
                            index, "likes", newLikes)
                        commentsModel.setProperty(
                            index, "liked", !item.liked)
                        DBAL.likeComment(
                            dbal, item.commentId,
                            newLikes)
                    }
                    onDeleted: {
                        var item = commentsModel.get(
                            index)
                        if (!item) return
                        DBAL.deleteComment(
                            dbal, item.commentId)
                        commentsModel.remove(index)
                    }
                }
            }

            CCard {
                Layout.fillWidth: true
                visible: commentsModel.count === 0
                Item {
                    Layout.preferredHeight: 24
                }
                CText {
                    Layout.fillWidth: true
                    variant: "h4"
                    text: "No comments yet"
                    horizontalAlignment:
                        Text.AlignHCenter
                }
                CText {
                    Layout.fillWidth: true
                    variant: "body2"
                    text: "Be the first to start"
                        + " the discussion!"
                    horizontalAlignment:
                        Text.AlignHCenter
                }
                Item {
                    Layout.preferredHeight: 24
                }
            }

            Item { Layout.preferredHeight: 20 }
        }
    }
}
