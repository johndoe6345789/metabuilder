-- Get user permission level
-- Single function module for permission checking

local LEVELS = require("levels")

---@class GetLevel
local M = {}

local ROLE_MAP = {
  public = LEVELS.PUBLIC,
  user = LEVELS.USER,
  moderator = LEVELS.MODERATOR,
  admin = LEVELS.ADMIN,
  god = LEVELS.GOD,
  supergod = LEVELS.SUPERGOD
}

---Get the permission level for a user
---@param user? User User object with role field
---@return number Permission level (1-6)
function M.get_level(user)
  if not user then return LEVELS.PUBLIC end
  return ROLE_MAP[user.role] or LEVELS.PUBLIC
end

return M
