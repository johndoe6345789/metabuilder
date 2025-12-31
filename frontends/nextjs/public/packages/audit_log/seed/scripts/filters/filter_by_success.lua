-- Filter logs by success status

---@class FilterBySuccess
local M = {}

---Filter logs by success status
---@param logs AuditLog[]? Array of audit log entries
---@param success boolean? Success status to filter by (nil = no filter)
---@return AuditLog[] Filtered logs
function M.filterBySuccess(logs, success)
  if success == nil then
    return logs or {}
  end

  local result = {}
  for _, log in ipairs(logs or {}) do
    if log.success == success then
      result[#result + 1] = log
    end
  end
  return result
end

return M
