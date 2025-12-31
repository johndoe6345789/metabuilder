-- Get stats grouped by operation type

---@class GetStatsByOperation
local M = {}

---Get statistics grouped by operation type
---@param logs AuditLog[]? Array of audit log entries
---@return table<string, OperationStats> Map of operation to stats
function M.getStatsByOperation(logs)
  local byOperation = {}

  if not logs then
    return byOperation
  end

  for _, log in ipairs(logs) do
    local op = log.operation or "UNKNOWN"
    if not byOperation[op] then
      byOperation[op] = { total = 0, successful = 0, failed = 0 }
    end
    byOperation[op].total = byOperation[op].total + 1
    if log.success then
      byOperation[op].successful = byOperation[op].successful + 1
    else
      byOperation[op].failed = byOperation[op].failed + 1
    end
  end

  return byOperation
end

return M
