-- Type definitions for system module
-- Shared across all system administration functions

---@class Metric
---@field id string
---@field label string

---@class Service
---@field id string
---@field label string

---@class FilterOption
---@field id string
---@field options? string[]
---@field type? string

---@class SystemStatsComponent
---@field type string
---@field metrics Metric[]

---@class SystemHealthComponent
---@field type string
---@field services Service[]

---@class SystemLogsComponent
---@field type string
---@field filters FilterOption[]

---@class MaintenanceToggleComponent
---@field type string
---@field enabled boolean
---@field warningMessage string

return {}
