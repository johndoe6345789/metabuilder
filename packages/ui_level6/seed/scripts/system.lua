-- System administration for supergod

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

local M = {}

---@return SystemStatsComponent
function M.system_stats()
  return {
    type = "system_stats",
    metrics = {
      { id = "tenants", label = "Total Tenants" },
      { id = "users", label = "Total Users" },
      { id = "storage", label = "Storage Used" },
      { id = "requests", label = "API Requests (24h)" }
    }
  }
end

---@return SystemHealthComponent
function M.system_health()
  return {
    type = "system_health",
    services = {
      { id = "database", label = "Database" },
      { id = "cache", label = "Cache" },
      { id = "queue", label = "Job Queue" },
      { id = "storage", label = "Object Storage" }
    }
  }
end

---@return SystemLogsComponent
function M.system_logs()
  return {
    type = "system_logs",
    filters = {
      { id = "level", options = { "error", "warn", "info", "debug" } },
      { id = "service", options = { "api", "worker", "scheduler" } },
      { id = "tenant", type = "tenant_select" }
    }
  }
end

---@param enabled boolean
---@return MaintenanceToggleComponent
function M.maintenance_mode(enabled)
  return {
    type = "maintenance_toggle",
    enabled = enabled,
    warningMessage = "Enabling maintenance mode will prevent all non-supergod users from accessing the system."
  }
end

return M
