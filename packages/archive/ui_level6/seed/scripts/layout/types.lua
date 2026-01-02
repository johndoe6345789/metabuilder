-- Type definitions for Level 6 layout components

---@class SidebarComponent
---@field type string
---@field width string
---@field theme string
---@field items table[]

---@class ToolbarComponent
---@field type string
---@field actions table[]
---@field showAllTenants boolean
---@field showSystemMetrics boolean

---@class ContentComponent
---@field type string
---@field fullWidth boolean
---@field multiTenant boolean
---@field children table[]

return {}
