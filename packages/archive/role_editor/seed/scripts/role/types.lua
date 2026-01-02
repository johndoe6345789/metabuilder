-- Type definitions for role editor

---@alias UserRole "public"|"user"|"moderator"|"admin"|"god"|"supergod"

---@class RoleInfo
---@field label string
---@field blurb string
---@field highlights string[]
---@field badge string
---@field variant "default"|"secondary"

---@class RoleConfig
---@field roles table<UserRole, RoleInfo>

---@class RoleEditorProps
---@field role UserRole
---@field allowedRoles? UserRole[]
---@field showInstanceOwner? boolean
---@field isInstanceOwner? boolean

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]
