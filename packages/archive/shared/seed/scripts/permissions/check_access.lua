-- Check if user has permission to access a package or component
-- Single function module for access control

---@class CheckAccess
local M = {}

---Check if user has required permission level for a resource
---@param userLevel PermissionLevel Current user's permission level (0-6)
---@param permissions PackagePermissions|ComponentPermission Permission requirements
---@param featureFlags? table<string, boolean> Active feature flags
---@param databaseEnabled? boolean Whether database is enabled
---@return PermissionCheckResult Result with allowed status and reason
function M.check_access(userLevel, permissions, featureFlags, databaseEnabled)
  -- Default feature flags and database state
  featureFlags = featureFlags or {}
  databaseEnabled = databaseEnabled ~= false -- Default to true

  -- Check if resource is enabled
  if permissions.enabled == false then
    return {
      allowed = false,
      reason = "Resource is currently disabled"
    }
  end

  -- Check minimum permission level
  local minLevel = permissions.minLevel or 0
  if userLevel < minLevel then
    return {
      allowed = false,
      reason = "Insufficient permission level",
      requiredLevel = minLevel
    }
  end

  -- Check database requirement
  if permissions.databaseRequired and not databaseEnabled then
    return {
      allowed = false,
      reason = "Database is required but not enabled"
    }
  end

  if permissions.requireDatabase and not databaseEnabled then
    return {
      allowed = false,
      reason = "Database is required but not enabled"
    }
  end

  -- Check feature flags (only if specified)
  if permissions.featureFlags then
    for _, flag in ipairs(permissions.featureFlags) do
      if not featureFlags[flag] then
        return {
          allowed = false,
          reason = "Required feature flag '" .. flag .. "' is not enabled"
        }
      end
    end
  end

  -- All checks passed
  return {
    allowed = true
  }
end

return M
