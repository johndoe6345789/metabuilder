-- Type definitions for schemas module

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class SchemaField
---@field name string
---@field type string

---@class Schema
---@field id string
---@field name string
---@field description? string
---@field fields? SchemaField[]

---@class SchemasRenderContext
---@field schemas? Schema[]

---@class ActionResult
---@field success boolean
---@field action string
---@field id? string

return {}
