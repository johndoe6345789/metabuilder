--- Stats Grid Package
--- Provides configurable statistics grid display components
---@module init

---@class StatsGridModule
---@field stats table Statistics functions
---@field formatters table Value formatting utilities
return {
  stats = require("stats"),
  formatters = require("formatters")
}
