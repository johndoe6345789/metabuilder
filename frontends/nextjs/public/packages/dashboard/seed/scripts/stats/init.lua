-- Dashboard stats module

---@class StatsModule
---@field card fun(props: StatCardProps): UIComponent Create a stat card
---@field grid fun(stats: StatCardProps[]): UIComponent Create a grid of stat cards

---@type StatsModule
local stats = {
  card = require("stats.card").create,
  grid = require("stats.grid").create
}

return stats
