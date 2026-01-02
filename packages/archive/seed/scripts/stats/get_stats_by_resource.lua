-- Get stats grouped by resource type

---@class GetStatsByResource
local M = {}

---Get statistics grouped by resource type
---@param logs AuditLog[]? Array of audit log entries
---@return table<string, OperationStats> Map of resource to stats
function M.getStatsByResource(logs)
  local byResource = {}

  if not logs then
    return byResource
  end

  for _, log in ipairs(logs) do
    local res = log.resource or "unknown"
    if not byResource[res] then
      byResource[res] = { total = 0, successful = 0, failed = 0 }
    end
    byResource[res].total = byResource[res].total + 1
    if log.success then
      byResource[res].successful = byResource[res].successful + 1
    else
      byResource[res].failed = byResource[res].failed + 1
    end
  end

  return byResource
end

return M
