// CommentsDBAL.js — DBAL logic for CommentsView

function loadJson(path) {
    var xhr = new XMLHttpRequest()
    try {
        xhr.open("GET", Qt.resolvedUrl(path), false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText)
    } catch(e) {}
    return null
}

function loadMockComments(model) {
    var data = loadJson("config/comments-mock.json")
    if (!data) return
    for (var i = 0; i < data.length; i++) model.append(data[i])
}

function loadComments(dbal, model) {
    dbal.list("comment", { take: 50 }, function(result, error) {
        if (result && result.items && result.items.length > 0) {
            model.clear()
            for (var i = 0; i < result.items.length; i++) {
                var c = result.items[i]
                model.append({
                    commentId: c.id || (i + 1),
                    username: c.username || c.author || "unknown",
                    initials: (c.username || c.author || "??")
                        .substring(0, 2).toUpperCase(),
                    timestamp: c.timestamp || c.createdAt || "Unknown",
                    body: c.body || c.text || "",
                    likes: c.likes || 0,
                    liked: false
                })
            }
        }
    })
}

function postComment(dbal, text, currentUser) {
    dbal.create("comment", { text: text, author: currentUser,
        username: currentUser }, function(result, error) {
        if (error) console.warn("Failed to post comment to DBAL:", error)
    })
}

function likeComment(dbal, commentId, newLikes) {
    dbal.update("comment", commentId, { likes: newLikes }, function(result,
        error) {
        if (error) console.warn("Failed to update like on DBAL:", error)
    })
}

function deleteComment(dbal, commentId) {
    dbal.remove("comment", commentId, function(result, error) {
        if (error) console.warn("Failed to delete comment on DBAL:", error)
    })
}
