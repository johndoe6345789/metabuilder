---@class CodegenPermissions
local M = {}

---@class User
---@field role? "public"|"user"|"admin"|"god"|"supergod"

---@param user User
---@return boolean
function M.can_generate(user)
  local role = user.role or "public"
  local allowed = {
    user = true,
    admin = true,
    god = true,
    supergod = true
  }
  return allowed[role] == true
end

return M
