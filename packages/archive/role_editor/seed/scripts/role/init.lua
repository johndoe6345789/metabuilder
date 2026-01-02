-- Role editor module
require("role.types")
local json = require("json")

---@class RoleModule
local M = {}

-- Load role configuration from JSON
---@type RoleConfig
M.config = json.load("config.json")

---Get role label with proper capitalization
---@param role UserRole
---@return string
function M.getRoleLabel(role)
  return M.config.roles[role].label
end

---Get role information
---@param role UserRole
---@return RoleInfo
function M.getRoleInfo(role)
  return M.config.roles[role]
end

---Get all available roles
---@return UserRole[]
function M.getAllRoles()
  local roles = {}
  for role, _ in pairs(M.config.roles) do
    table.insert(roles, role)
  end
  -- Sort to ensure consistent order
  table.sort(roles, function(a, b)
    local order = { public = 1, user = 2, moderator = 3, admin = 4, god = 5, supergod = 6 }
    return (order[a] or 99) < (order[b] or 99)
  end)
  return roles
end

---Filter roles by allowed list
---@param allowedRoles? UserRole[]
---@return UserRole[]
function M.filterRoles(allowedRoles)
  if not allowedRoles then
    return M.getAllRoles()
  end
  return allowedRoles
end

---Validate if a role exists
---@param role UserRole
---@return boolean
function M.isValidRole(role)
  return M.config.roles[role] ~= nil
end

return M
