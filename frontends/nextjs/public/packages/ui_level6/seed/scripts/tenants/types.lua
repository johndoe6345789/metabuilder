-- Type definitions for tenant management

---@class ColumnDefinition
---@field id string
---@field label string
---@field type? string

---@class TenantInfo
---@field id string
---@field name string
---@field owner string
---@field userCount number
---@field status string

---@class TenantListComponent
---@field type string
---@field columns ColumnDefinition[]

---@class TenantCardComponent
---@field type string
---@field id string
---@field name string
---@field owner string
---@field userCount number
---@field status string

---@class FormField
---@field id string
---@field type string
---@field label string
---@field required? boolean
---@field options? string[]

---@class FormComponent
---@field type string
---@field id string
---@field fields FormField[]

return {}
