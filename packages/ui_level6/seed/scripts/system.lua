-- System administration for supergod
local M = {}

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

function M.maintenance_mode(enabled)
  return {
    type = "maintenance_toggle",
    enabled = enabled,
    warningMessage = "Enabling maintenance mode will prevent all non-supergod users from accessing the system."
  }
end

return M
