-- Filter logs by operation type

---@class FilterByOperation
local M = {}

---Filter logs by operation type
---@param logs AuditLog[]? Array of audit log entries
---@param operation string? Operation to filter by (empty = no filter)
---@return AuditLog[] Filtered logs
function M.filterByOperation(logs, operation)
  if not operation or operation == "" then
    return logs or {}
  end

  local result = {}
  for _, log in ipairs(logs or {}) do
    if log.operation == operation then
      result[#result + 1] = log
    end
  end
  return result
end

return M
