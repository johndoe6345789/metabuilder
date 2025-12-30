-- Social feed list component

---@class FeedList
---@field type "feed_list" Component type
---@field layout "vertical" | "horizontal" | "grid" Layout mode
---@field children FeedPost[] Child post components

---Create a social feed list component
---@param posts? FeedPost[] Array of post components
---@param layout? "vertical" | "horizontal" | "grid" Layout mode (default: "vertical")
---@return FeedList
local function list(posts, layout)
  return {
    type = "feed_list",
    layout = layout or "vertical",
    children = posts or {}
  }
end

return list
