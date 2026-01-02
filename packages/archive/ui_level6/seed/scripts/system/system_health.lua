-- System health monitoring component
-- Single function module for supergod administration

---@class SystemHealth
local M = {}

---Render system health dashboard
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

return M
