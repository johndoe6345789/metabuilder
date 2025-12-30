-- Type definitions for navigation module

---@class User
---@field id string User identifier
---@field level? number User permission level

---@class Context
---@field user? User Current user or nil if not authenticated

---@class NavigationResult
---@field success boolean Whether navigation was allowed
---@field redirect? string URL to redirect to if not authorized
---@field route? string Target route on success
---@field message? string Error message if failed
---@field action? string Special action type
---@field url? string External URL for special actions

return {}
