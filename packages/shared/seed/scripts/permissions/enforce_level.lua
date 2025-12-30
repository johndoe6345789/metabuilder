-- Enforce minimum permission level requirement
-- Single function module for level enforcement

---@class EnforceLevel
local M = {}

---Enforce minimum permission level, throw error if not met
---@param userLevel PermissionLevel Current user's permission level (0-6)
---@param minLevel PermissionLevel Required minimum level
---@param resourceName? string Name of resource for error message
---@return boolean success Always returns true if no error thrown
function M.enforce_level(userLevel, minLevel, resourceName)
  if userLevel < minLevel then
    local resource = resourceName or "this resource"
    error(string.format(
      "Access denied to %s: requires level %d, user has level %d",
      resource,
      minLevel,
      userLevel
    ))
  end
  return true
end

return M
