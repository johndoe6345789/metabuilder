-- Navigate to Level 2 (User area)

local check = require("check")
local LEVELS = require("levels")

---@class Context
---@field user? table

---@class NavigationResult
---@field success boolean
---@field redirect? string
---@field route? string

local M = {}

---Navigate to Level 2 user area with permission check
---@param ctx Context
---@return NavigationResult
function M.toLevel2(ctx)
  if not check.can_access(ctx.user, LEVELS.USER) then
    return { success = false, redirect = "/login" }
  end
  return { success = true, route = "/level2" }
end

return M
