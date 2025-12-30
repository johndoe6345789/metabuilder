-- Dashboard stats module

---@class StatsModule
---@field card fun(title: string, value: string|number, icon: string?, trend: table?): StatCardConfig
---@field row fun(stats: table): StatRowConfig
---@field trend fun(direction: string, value: string): TrendIndicatorConfig

---@type StatsModule
local stats = {
  card = require("stats.card"),
  row = require("stats.row"),
  trend = require("stats.trend")
}

return stats
