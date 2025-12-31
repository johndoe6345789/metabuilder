-- System logs viewer component
-- Single function module for supergod administration

---@class SystemLogs
local M = {}

---Render system logs viewer
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

return M
