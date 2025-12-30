-- Type definitions for schemas module

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class ButtonProps
---@field text string
---@field onClick string
---@field data? string

---@class BadgeProps
---@field text string

---@class TypographyProps
---@field text string

---@class GridProps
---@field cols number
---@field gap number

---@class StackProps
---@field spacing number

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
