-- Filter logs by date range

---@class FilterByDateRange
local M = {}

---Filter logs by date range (timestamps in milliseconds)
---@param logs AuditLog[]? Array of audit log entries
---@param startTime number? Start of time range (nil = no lower bound)
---@param endTime number? End of time range (nil = no upper bound)
---@return AuditLog[] Filtered logs
function M.filterByDateRange(logs, startTime, endTime)
  local result = {}
  for _, log in ipairs(logs or {}) do
    local ts = log.timestamp
    local include = true
    if startTime and ts < startTime then
      include = false
    end
    if endTime and ts > endTime then
      include = false
    end
    if include then
      result[#result + 1] = log
    end
  end
  return result
end

return M
