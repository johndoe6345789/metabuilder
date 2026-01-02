-- Prepare stats for display with cards

local calculateStats = require("stats.calculate_stats")
local getStatsByOperation = require("stats.get_stats_by_operation")
local getStatsByResource = require("stats.get_stats_by_resource")

---@class PrepareStatsDisplay
local M = {}

---Prepare statistics data for display in a dashboard
---@param logs AuditLog[]? Array of audit log entries
---@return StatsDisplay Display-ready stats with cards and breakdowns
function M.prepareStatsDisplay(logs)
  local stats = calculateStats.calculateStats(logs)

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
    byOperation = getStatsByOperation.getStatsByOperation(logs),
    byResource = getStatsByResource.getStatsByResource(logs)
  }
end

return M
