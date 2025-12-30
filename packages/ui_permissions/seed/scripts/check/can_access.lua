-- Check if user can access a resource
-- Single function module for permission checking

local getLevel = require("check.get_level")

---@class CanAccess
local M = {}

---Check if user has required permission level
---@param user? User User object with role field
---@param required_level number Required permission level (1-6)
---@return boolean Whether user can access
function M.can_access(user, required_level)
  return getLevel.get_level(user) >= required_level
end

return M
