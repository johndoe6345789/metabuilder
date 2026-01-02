-- Permission system module facade
-- Exports all permission functions for easy access

---@class Permissions
local M = {}

-- Import all permission modules
local checkAccess = require("permissions.check_access")
local enforceLevel = require("permissions.enforce_level")
local manageFlags = require("permissions.manage_flags")
local databaseToggle = require("permissions.database_toggle")

-- Re-export access checking
M.check_access = checkAccess.check_access

-- Re-export level enforcement
M.enforce_level = enforceLevel.enforce_level

-- Re-export feature flag management
M.initialize_flags = manageFlags.initialize_flags
M.enable_flag = manageFlags.enable_flag
M.disable_flag = manageFlags.disable_flag
M.is_flag_enabled = manageFlags.is_flag_enabled
M.get_all_flags = manageFlags.get_all_flags
M.check_required_flags = manageFlags.check_required_flags

-- Re-export database toggle
M.initialize_database = databaseToggle.initialize_database
M.enable_database = databaseToggle.enable_database
M.disable_database = databaseToggle.disable_database
M.is_database_enabled = databaseToggle.is_database_enabled
M.require_database = databaseToggle.require_database
M.get_database_status = databaseToggle.get_database_status

---Check package permissions for a user
---@param userLevel PermissionLevel User's permission level
---@param packagePermissions PackagePermissions Package permission configuration
---@return PermissionCheckResult
function M.check_package_access(userLevel, packagePermissions)
  local featureFlags = M.get_all_flags()
  local databaseEnabled = M.is_database_enabled()
  return M.check_access(userLevel, packagePermissions, featureFlags, databaseEnabled)
end

---Check component permissions for a user
---@param userLevel PermissionLevel User's permission level
---@param componentPermissions ComponentPermission Component permission configuration
---@return PermissionCheckResult
function M.check_component_access(userLevel, componentPermissions)
  local featureFlags = M.get_all_flags()
  local databaseEnabled = M.is_database_enabled()
  return M.check_access(userLevel, componentPermissions, featureFlags, databaseEnabled)
end

---Check if user has a specific permission (new-style permissions map)
---@param userLevel PermissionLevel User's permission level
---@param permissions PackagePermissions The permissions map from metadata.json
---@param permission string The permission key to check (e.g., "forum.post.create")
---@return PermissionCheckResult
function M.has_permission(userLevel, permissions, permission)
  if not permissions then
    return { allowed = false, reason = "No permissions defined" }
  end
  
  local permDef = permissions[permission]
  if not permDef then
    return { allowed = false, reason = "Permission not found: " .. permission }
  end
  
  if userLevel < permDef.minLevel then
    return {
      allowed = false,
      reason = "Insufficient level for " .. permission,
      requiredLevel = permDef.minLevel
    }
  end
  
  -- Check feature flags if defined
  if permDef.featureFlags then
    local flagsOk = M.check_required_flags(permDef.featureFlags)
    if not flagsOk.allowed then
      return flagsOk
    end
  end
  
  -- Check database if required
  if permDef.requireDatabase and not M.is_database_enabled() then
    return { allowed = false, reason = "Database required for " .. permission }
  end
  
  return { allowed = true }
end

---Get all permissions a user has from a permissions map
---@param userLevel PermissionLevel User's permission level
---@param permissions PackagePermissions The permissions map from metadata.json
---@return string[] List of permission keys the user has
function M.get_user_permissions(userLevel, permissions)
  if not permissions then return {} end
  
  local result = {}
  for permKey, permDef in pairs(permissions) do
    if userLevel >= permDef.minLevel then
      table.insert(result, permKey)
    end
  end
  return result
end

return M
