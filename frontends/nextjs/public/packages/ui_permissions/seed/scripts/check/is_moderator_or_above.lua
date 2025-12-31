-- Check if user is moderator or above
-- Single function module for permission checking

local LEVELS = require("levels")
local getLevel = require("check.get_level")

---@class IsModeratorOrAbove
local M = {}

---Check if user is moderator level or higher
---@param user? User User object with role field
---@return boolean Whether user is moderator or above
function M.is_moderator_or_above(user)
  return getLevel.get_level(user) >= LEVELS.MODERATOR
end

return M
