-- Formatting helpers for audit log display
local M = {}

-- Operation type to color mapping
M.operationColors = {
  CREATE = "bg-green-500",
  READ = "bg-blue-500",
  UPDATE = "bg-yellow-500",
  DELETE = "bg-red-500"
}

-- Resource type to icon mapping
M.resourceIcons = {
  user = "User",
  credential = "ShieldCheck",
  default = "ChartLine"
}

-- Get color class for operation
function M.getOperationColor(operation)
  return M.operationColors[operation] or "bg-gray-500"
end

-- Get icon name for resource
function M.getResourceIcon(resource)
  return M.resourceIcons[resource] or M.resourceIcons.default
end

-- Format timestamp for display
function M.formatTimestamp(timestamp)
  if not timestamp then
    return "Unknown"
  end
  
  -- Assuming timestamp is in milliseconds
  local seconds = math.floor(timestamp / 1000)
  return os.date("%Y-%m-%d %H:%M:%S", seconds)
end

-- Format a log entry for display
function M.formatLogEntry(log)
  return {
    id = log.id,
    operation = log.operation,
    operationColor = M.getOperationColor(log.operation),
    resource = log.resource,
    resourceId = log.resourceId,
    resourceIcon = M.getResourceIcon(log.resource),
    username = log.username,
    timestamp = M.formatTimestamp(log.timestamp),
    ipAddress = log.ipAddress,
    success = log.success,
    errorMessage = log.errorMessage,
    rowClass = log.success and "bg-card" or "bg-destructive/5 border-destructive/20"
  }
end

-- Format all logs for display
function M.formatAllLogs(logs)
  local result = {}
  for i, log in ipairs(logs or {}) do
    result[i] = M.formatLogEntry(log)
  end
  return result
end

-- Get status badge text
function M.getStatusBadge(log)
  if log.success then
    return nil
  end
  return "Failed"
end

return M
