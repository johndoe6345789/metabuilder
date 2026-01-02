-- LuaCATS type definitions for ui_permissions package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Permission Level System (6-Level Hierarchy)
--------------------------------------------------------------------------------

---@alias PermissionLevel
---| 1 # PUBLIC - Anonymous visitors
---| 2 # USER - Logged-in users
---| 3 # MODERATOR - Content moderators
---| 4 # ADMIN - Administrators
---| 5 # GOD - System operators
---| 6 # SUPERGOD - Platform owners

---@class PermissionLevels
---@field PUBLIC 1
---@field USER 2
---@field MODERATOR 3
---@field ADMIN 4
---@field GOD 5
---@field SUPERGOD 6

---@class LevelInfo
---@field level PermissionLevel Numeric level
---@field name string Level name (e.g., "Admin")
---@field description string What this level can do
---@field color string Theme color for badges
---@field icon string Icon name

--------------------------------------------------------------------------------
-- Permission Check Types
--------------------------------------------------------------------------------

---@class PermissionCheckOptions
---@field resource? string Resource being accessed
---@field action? "read"|"write"|"delete"|"admin" Action being performed
---@field tenantId? string Tenant context

---@class PermissionCheckResult
---@field allowed boolean Whether access is allowed
---@field reason? string Explanation if denied
---@field requiredLevel? PermissionLevel Level needed for access

---@class User
---@field id string User ID
---@field username string Username
---@field level PermissionLevel User's permission level
---@field tenantId? string User's tenant

--------------------------------------------------------------------------------
-- Permission Functions
--------------------------------------------------------------------------------

---@class PermissionCheckModule
---@field hasLevel fun(user: User, required: PermissionLevel): boolean Check if user has minimum level
---@field canAccess fun(user: User, resource: string, options?: PermissionCheckOptions): PermissionCheckResult Full access check
---@field getLevelInfo fun(level: PermissionLevel): LevelInfo Get level metadata
---@field compareLevels fun(a: PermissionLevel, b: PermissionLevel): number Compare two levels (-1, 0, 1)

--------------------------------------------------------------------------------
-- Level Badge Component
--------------------------------------------------------------------------------

---@class LevelBadgeProps
---@field level PermissionLevel Level to display
---@field showLabel? boolean Show level name
---@field size? "small"|"medium"|"large" Badge size
---@field variant? "filled"|"outlined" Badge style

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

return {}
