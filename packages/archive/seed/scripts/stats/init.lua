-- Audit log statistics module
-- Facade that re-exports all stats functions

local calculateStats = require("stats.calculate_stats")
local getStatsByOperation = require("stats.get_stats_by_operation")
local getStatsByResource = require("stats.get_stats_by_resource")
local prepareStatsDisplay = require("stats.prepare_stats_display")

---@class StatsModule
---@field calculateStats fun(logs: AuditLog[]?): AuditStats
---@field getStatsByOperation fun(logs: AuditLog[]?): table<string, OperationStats>
---@field getStatsByResource fun(logs: AuditLog[]?): table<string, OperationStats>
---@field prepareStatsDisplay fun(logs: AuditLog[]?): StatsDisplay

---@type StatsModule
local M = {
  calculateStats = calculateStats.calculateStats,
  getStatsByOperation = getStatsByOperation.getStatsByOperation,
  getStatsByResource = getStatsByResource.getStatsByResource,
  prepareStatsDisplay = prepareStatsDisplay.prepareStatsDisplay,
}

return M
