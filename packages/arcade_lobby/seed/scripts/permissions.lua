---@class Permissions
local M = {}

---@class User
---@field role? "public"|"admin"|"god"|"supergod"

---@param user User
---@return boolean
function M.can_create_tournament(user)
  local role = user.role or "public"
  local allowed = {
    admin = true,
    god = true,
    supergod = true
  }
  return allowed[role] == true
end

return M
