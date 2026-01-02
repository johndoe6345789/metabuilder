-- Format all logs for display

local formatLogEntry = require("formatting.format_log_entry")

---@class FormatAllLogs
local M = {}

---Format all logs in an array for display
---@param logs AuditLog[]? Array of raw log entries
---@return FormattedLogEntry[] Array of formatted entries
function M.formatAllLogs(logs)
  local result = {}
  for i, log in ipairs(logs or {}) do
    result[i] = formatLogEntry.formatLogEntry(log)
  end
  return result
end

return M
