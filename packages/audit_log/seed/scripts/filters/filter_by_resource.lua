-- Filter logs by resource type

---@class FilterByResource
local M = {}

---Filter logs by resource type
---@param logs AuditLog[]? Array of audit log entries
---@param resource string? Resource to filter by (empty = no filter)
---@return AuditLog[] Filtered logs
function M.filterByResource(logs, resource)
  if not resource or resource == "" then
    return logs or {}
  end

  local result = {}
  for _, log in ipairs(logs or {}) do
    if log.resource == resource then
      result[#result + 1] = log
    end
  end
  return result
end

return M
