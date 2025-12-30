-- Social feed list component
local function list(posts, layout)
  return {
    type = "feed_list",
    layout = layout or "vertical",
    children = posts or {}
  }
end

return list
