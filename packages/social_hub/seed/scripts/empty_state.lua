--- Render empty state component
---@return EmptyStateComponent Empty state component
local function empty_state()
  return {
    type = "empty_state",
    props = {
      icon = "inbox",
      title = "No posts yet",
      message = "Be the first to share something!"
    }
  }
end

return empty_state
