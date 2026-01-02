--- Stats rendering facade for social hub
--- Re-exports single-function modules for backward compatibility
---@module stats

---@class StatsModule
---@field render_stat fun(stat: table): string Render single stat
---@field render_stats fun(stats: table[]): string Render stats grid
---@field render_hero fun(stats: table): string Render hero stats section
local M = {}

M.render_stat = require("render_stat")
M.render_stats = require("render_stats")
M.render_hero = require("render_hero")

return M
