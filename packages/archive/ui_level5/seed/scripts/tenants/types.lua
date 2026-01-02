-- Type definitions for tenant management module
-- Shared across all tenant functions

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class Tenant
---@field id string
---@field name string
---@field userCount number

---@class TenantContext
---@field tenants? Tenant[]
---@field tenantId? string

---@class ActionResult
---@field success boolean
---@field action string
---@field id? string

return {}
