-- Type definitions for role_editor package
-- Central types file re-exporting all module types
-- @meta

-- Re-export role module types
local role_types = require("role.types")

---@alias UserRole "public"|"user"|"moderator"|"admin"|"god"|"supergod"

---@alias PermissionLevel 0|1|2|3|4|5|6

-- Permission level mapping
-- Level 0: Public (anonymous)
-- Level 1: User (authenticated)
-- Level 2: Moderator
-- Level 3: Admin
-- Level 4: God
-- Level 5: Supergod

---@class RoleInfo
---@field label string Display label for the role
---@field blurb string Short description
---@field highlights string[] Feature highlights for this role
---@field badge string Badge icon name
---@field variant "default"|"secondary" Visual variant
---@field level PermissionLevel Permission level number

---@class RoleConfig
---@field roles table<UserRole, RoleInfo> Role definitions

---@class Permission
---@field id string Permission identifier
---@field name string Permission display name
---@field description string Permission description
---@field category string Permission category
---@field minLevel PermissionLevel Minimum level required

---@class RolePermissions
---@field role UserRole Role identifier
---@field permissions string[] Granted permission IDs
---@field inherited string[] Inherited permission IDs from lower roles

---@class RoleEditorProps
---@field currentRole UserRole Current user's role
---@field targetRole UserRole Role being edited
---@field allowedRoles? UserRole[] Roles the current user can assign
---@field permissions Permission[] Available permissions
---@field rolePermissions RolePermissions[] Permission assignments
---@field onSave? fun(role: UserRole, permissions: string[]): void Save callback
---@field onCancel? fun(): void Cancel callback
---@field readonly? boolean Read-only mode

---@class RoleCardProps
---@field role UserRole Role to display
---@field info RoleInfo Role information
---@field selected? boolean Whether card is selected
---@field onClick? fun(role: UserRole): void Click callback
---@field showBadge? boolean Show role badge

---@class RoleEditorState
---@field selectedRole UserRole Currently selected role
---@field modifiedPermissions table<string, boolean> Modified permission states
---@field isDirty boolean Has unsaved changes

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
