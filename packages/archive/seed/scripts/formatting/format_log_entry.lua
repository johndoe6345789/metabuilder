-- Format a single log entry for display

local getOperationColor = require("formatting.get_operation_color")
local getResourceIcon = require("formatting.get_resource_icon")
local formatTimestamp = require("formatting.format_timestamp")

---@class FormatLogEntry
local M = {}

---Format a log entry for display in a table
---@param log AuditLog Raw log entry
---@return FormattedLogEntry Formatted entry with display strings
function M.formatLogEntry(log)
  return {
    id = log.id,
    operation = log.operation,
    operationColor = getOperationColor.getOperationColor(log.operation),
    resource = log.resource,
    resourceId = log.resourceId,
    resourceIcon = getResourceIcon.getResourceIcon(log.resource),
    username = log.username,
    timestamp = formatTimestamp.formatTimestamp(log.timestamp),
    ipAddress = log.ipAddress,
    success = log.success,
    errorMessage = log.errorMessage,
    rowClass = log.success and "bg-card" or "bg-destructive/5 border-destructive/20"
  }
end

return M
