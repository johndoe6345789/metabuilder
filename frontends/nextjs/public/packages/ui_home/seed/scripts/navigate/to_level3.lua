-- Navigate to Level 3 (Admin area)

local check = require("check")
local LEVELS = require("levels")

---@class Context
---@field user? table

---@class NavigationResult
---@field success boolean
---@field message? string
---@field route? string

local M = {}

---Navigate to Level 3 admin area with permission check
---@param ctx Context
---@return NavigationResult
function M.toLevel3(ctx)
  if not check.can_access(ctx.user, LEVELS.ADMIN) then
    return { success = false, message = "Admin required" }
  end
  return { success = true, route = "/level3" }
end

return M
