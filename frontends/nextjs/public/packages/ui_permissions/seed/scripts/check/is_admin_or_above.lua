-- Check if user is admin or above
-- Single function module for permission checking

local LEVELS = require("levels")
local getLevel = require("check.get_level")

---@class IsAdminOrAbove
local M = {}

---Check if user is admin level or higher
---@param user? User User object with role field
---@return boolean Whether user is admin or above
function M.is_admin_or_above(user)
  return getLevel.get_level(user) >= LEVELS.ADMIN
end

return M
