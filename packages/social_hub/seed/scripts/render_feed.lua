local render_post = require("render_post")

--- Render a feed of posts
---@param posts Post[] Array of posts
---@return FeedComponent Feed component
local function render_feed(posts)
  local items = {}
  for _, post in ipairs(posts) do
    table.insert(items, render_post(post))
  end
  return {
    type = "social_feed",
    children = items
  }
end

return render_feed
