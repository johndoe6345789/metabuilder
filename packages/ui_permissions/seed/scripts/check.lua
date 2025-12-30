-- Permission checking functions

local LEVELS = require("levels")

---@class User
---@field role? string

---@class RoleMap
---@field [string] number

local M = {}

local ROLE_MAP = {
  public = LEVELS.PUBLIC,
  user = LEVELS.USER,
  moderator = LEVELS.MODERATOR,
  admin = LEVELS.ADMIN,
  god = LEVELS.GOD,
  supergod = LEVELS.SUPERGOD
}

---@param user? User
---@return number
function M.get_level(user)
  if not user then return LEVELS.PUBLIC end
  return ROLE_MAP[user.role] or LEVELS.PUBLIC
end

---@param user? User
---@param required_level number
---@return boolean
function M.can_access(user, required_level)
  return M.get_level(user) >= required_level
end

---@param user? User
---@return boolean
function M.is_moderator_or_above(user)
  return M.get_level(user) >= LEVELS.MODERATOR
end

---@param user? User
---@return boolean
function M.is_admin_or_above(user)
  return M.get_level(user) >= LEVELS.ADMIN
end

return M
