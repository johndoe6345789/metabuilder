--- Render a single post component
---@param post Post Post data
---@return PostComponent Post component
local function render_post(post)
  return {
    type = "feed_post",
    props = {
      id = post.id,
      author = post.author,
      avatar = post.avatar,
      content = post.content,
      timestamp = post.created_at,
      likes = post.likes or 0,
      comments = post.comments or 0
    }
  }
end

return render_post
