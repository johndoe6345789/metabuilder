-- Permission system type definitions
-- Defines the structure for package and component permissions

--------------------------------------------------------------------------------
-- Permission Level Enum
--------------------------------------------------------------------------------

---@alias PermissionLevel integer
---| 0 # PUBLIC - No authentication required
---| 1 # PUBLIC - No authentication required (same as 0)
---| 2 # USER - Authenticated user
---| 3 # MODERATOR - Moderator access
---| 4 # ADMIN - Administrator access
---| 5 # GOD - Super administrator
---| 6 # SUPERGOD - System owner

--------------------------------------------------------------------------------
-- Component Permission (Legacy)
--------------------------------------------------------------------------------

---@class ComponentPermission
---@field enabled boolean Component enabled/disabled
---@field minLevel PermissionLevel Minimum permission level required
---@field featureFlags? string[] Required feature flags (optional)
---@field requireDatabase? boolean Whether this component requires database (optional)

--------------------------------------------------------------------------------
-- Package Permissions (Legacy Style)
--------------------------------------------------------------------------------

---@class PackagePermissionsLegacy
---@field enabled boolean Package enabled/disabled
---@field minLevel PermissionLevel Minimum level to access package (0-6)
---@field databaseRequired? boolean Whether package needs database connection
---@field components? table<string, ComponentPermission> Per-component permissions

--------------------------------------------------------------------------------
-- Permission Definition (New Style)
-- Each permission is a key like "forum.post.create" with a definition
--------------------------------------------------------------------------------

---@class PermissionDef
---@field minLevel PermissionLevel Minimum level required for this permission
---@field description string Human-readable description
---@field featureFlags? string[] Optional feature flags required
---@field requireDatabase? boolean Whether database connection is required

---@alias PackagePermissions table<string, PermissionDef>

--------------------------------------------------------------------------------
-- Permission Check Result
--------------------------------------------------------------------------------

---@class PermissionCheckResult
---@field allowed boolean Whether access is allowed
---@field reason? string Denial reason if not allowed
---@field requiredLevel? PermissionLevel Required level if denied

--------------------------------------------------------------------------------
-- Feature Flag State
--------------------------------------------------------------------------------

---@class FeatureFlagState
---@field flags table<string, boolean> Active feature flags
---@field databaseEnabled boolean Whether database is currently enabled

return {}
