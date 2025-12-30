-- User table filters
local function user_filters()
  return {
    { id = "role", type = "select", options = { "admin", "user", "guest" } },
    { id = "status", type = "select", options = { "active", "inactive" } },
    { id = "search", type = "text", placeholder = "Search users..." }
  }
end

return user_filters
