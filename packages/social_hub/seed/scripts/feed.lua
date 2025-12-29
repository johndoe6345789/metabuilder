-- Social feed rendering
local M = {}

function M.render_post(post)
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

function M.render_feed(posts)
  local items = {}
  for _, post in ipairs(posts) do
    table.insert(items, M.render_post(post))
  end
  return {
    type = "social_feed",
    children = items
  }
end

function M.empty_state()
  return {
    type = "empty_state",
    props = {
      icon = "inbox",
      title = "No posts yet",
      message = "Be the first to share something!"
    }
  }
end

return M
