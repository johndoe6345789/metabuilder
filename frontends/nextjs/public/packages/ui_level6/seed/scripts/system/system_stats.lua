-- System statistics dashboard component
-- Single function module for supergod administration

---@class SystemStats
local M = {}

---Render system statistics dashboard
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

return M
