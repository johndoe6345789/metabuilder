-- Statistics calculation for audit logs
local M = {}

---@class AuditLog
---@field id string
---@field operation string
---@field resource string
---@field resourceId string
---@field username string
---@field timestamp number
---@field ipAddress string
---@field success boolean
---@field errorMessage string?

---@class AuditStats
---@field total number
---@field successful number
---@field failed number
---@field rateLimit number

---@class OperationStats
---@field total number
---@field successful number
---@field failed number

---@class StatCard
---@field title string
---@field value number
---@field icon string
---@field color string

---@class StatsDisplay
---@field cards StatCard[]
---@field byOperation table<string, OperationStats>
---@field byResource table<string, OperationStats>

--- Calculate stats from a list of logs
---@param logs AuditLog[] | nil
---@return AuditStats
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

--- Get stats grouped by operation type
---@param logs AuditLog[] | nil
---@return table<string, OperationStats>
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

--- Get stats grouped by resource type
---@param logs AuditLog[] | nil
---@return table<string, OperationStats>
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

--- Prepare stats for display
---@param logs AuditLog[] | nil
---@return StatsDisplay
function M.prepareStatsDisplay(logs)
  local stats = M.calculateStats(logs)

  return {
    cards = {
      {
        title = "Total Operations",
        value = stats.total,
        icon = "ChartLine",
        color = "default"
      },
      {
        title = "Successful",
        value = stats.successful,
        icon = "ShieldCheck",
        color = "green"
      },
      {
        title = "Failed",
        value = stats.failed,
        icon = "Warning",
        color = "red"
      },
      {
        title = "Rate Limited",
        value = stats.rateLimit,
        icon = "Clock",
        color = "yellow"
      }
    },
    byOperation = M.getStatsByOperation(logs),
    byResource = M.getStatsByResource(logs)
  }
end

return M
