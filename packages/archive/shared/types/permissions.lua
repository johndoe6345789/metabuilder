---@class PermissionLevel
---@field PUBLIC number 0 - Public (no login required)
---@field USER number 1 - Logged in users
---@field MODERATOR number 2 - Moderators
---@field ADMIN number 3 - Administrators
---@field GOD number 4 - God mode (full access)
---@field SUPERGOD number 5 - Supergod (system level)

---@class PermissionLevels
---@field PUBLIC number
---@field USER number
---@field MODERATOR number
---@field ADMIN number
---@field GOD number
---@field SUPERGOD number

---@type PermissionLevels
local LEVELS = {
  PUBLIC = 0,
  USER = 1,
  MODERATOR = 2,
  ADMIN = 3,
  GOD = 4,
  SUPERGOD = 5
}

---@class PermissionContext
---@field user_id string|nil The user's ID
---@field username string|nil The user's username
---@field level number The user's permission level
---@field tenant_id string|nil The tenant ID
---@field features table<string, boolean>|nil Enabled features

---@class PermissionCheck
---@field required_level number Minimum permission level required
---@field feature string|nil Feature flag that must be enabled
---@field tenant_specific boolean|nil Whether permission is tenant-specific

---@class PermissionResult
---@field allowed boolean Whether the action is allowed
---@field reason string|nil Reason for denial

local M = {}

---Check if a user has the required permission level
---@param ctx PermissionContext The user's permission context
---@param required_level number The required permission level
---@return boolean allowed True if the user has sufficient permissions
function M.has_level(ctx, required_level)
  return ctx.level >= required_level
end

---Check if a user can access a feature
---@param ctx PermissionContext The user's permission context
---@param check PermissionCheck The permission check configuration
---@return PermissionResult result The permission check result
function M.can_access(ctx, check)
  -- Check permission level
  if ctx.level < check.required_level then
    return {
      allowed = false,
      reason = string.format(
        "Requires level %d (%s), user has level %d",
        check.required_level,
        M.level_name(check.required_level),
        ctx.level
      )
    }
  end

  -- Check feature flag if specified
  if check.feature and ctx.features then
    if not ctx.features[check.feature] then
      return {
        allowed = false,
        reason = string.format("Feature '%s' is not enabled", check.feature)
      }
    end
  end

  -- Check tenant-specific permissions
  if check.tenant_specific and not ctx.tenant_id then
    return {
      allowed = false,
      reason = "Tenant-specific operation requires valid tenant_id"
    }
  end

  return { allowed = true }
end

---Get the name of a permission level
---@param level number The permission level
---@return string name The level name
function M.level_name(level)
  local names = {
    [0] = "PUBLIC",
    [1] = "USER",
    [2] = "MODERATOR",
    [3] = "ADMIN",
    [4] = "GOD",
    [5] = "SUPERGOD"
  }
  return names[level] or "UNKNOWN"
end

---Create a permission context for an anonymous user
---@return PermissionContext ctx Anonymous permission context
function M.anonymous()
  return {
    level = LEVELS.PUBLIC,
    features = {}
  }
end

---Create a permission context for a logged-in user
---@param user_id string The user's ID
---@param username string The user's username
---@param level number The user's permission level
---@param tenant_id string|nil The tenant ID
---@param features table<string, boolean>|nil Enabled features
---@return PermissionContext ctx User permission context
function M.user_context(user_id, username, level, tenant_id, features)
  return {
    user_id = user_id,
    username = username,
    level = level,
    tenant_id = tenant_id,
    features = features or {}
  }
end

---Check if user is admin or higher
---@param ctx PermissionContext The user's permission context
---@return boolean is_admin True if user is admin or higher
function M.is_admin(ctx)
  return ctx.level >= LEVELS.ADMIN
end

---Check if user is moderator or higher
---@param ctx PermissionContext The user's permission context
---@return boolean is_moderator True if user is moderator or higher
function M.is_moderator(ctx)
  return ctx.level >= LEVELS.MODERATOR
end

---Check if user is god mode or higher
---@param ctx PermissionContext The user's permission context
---@return boolean is_god True if user is god mode or higher
function M.is_god(ctx)
  return ctx.level >= LEVELS.GOD
end

---Filter a list based on permission requirements
---@param items table[] List of items to filter
---@param ctx PermissionContext User permission context
---@param get_required_level fun(item: table): number Function to get required level for item
---@return table[] filtered Filtered list of items user can access
function M.filter_by_permission(items, ctx, get_required_level)
  local filtered = {}
  for _, item in ipairs(items) do
    local required = get_required_level(item)
    if M.has_level(ctx, required) then
      table.insert(filtered, item)
    end
  end
  return filtered
end

-- Export permission levels
M.LEVELS = LEVELS

return M
