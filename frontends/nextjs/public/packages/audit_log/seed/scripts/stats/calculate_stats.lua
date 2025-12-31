-- Calculate basic stats from audit logs

---@class CalculateStats
local M = {}

---Calculate basic statistics from a list of logs
---@param logs AuditLog[]? Array of audit log entries
---@return AuditStats Statistics object with totals
function M.calculateStats(logs)
  local stats = {
    total = 0,
    successful = 0,
    failed = 0,
    rateLimit = 0
  }

  if not logs then
    return stats
  end

  stats.total = #logs

  for _, log in ipairs(logs) do
    if log.success then
      stats.successful = stats.successful + 1
    else
      stats.failed = stats.failed + 1
    end

    if log.errorMessage and string.match(log.errorMessage, "Rate limit") then
      stats.rateLimit = stats.rateLimit + 1
    end
  end

  return stats
end

return M
