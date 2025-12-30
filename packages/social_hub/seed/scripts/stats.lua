--- Stats rendering facade for social hub
--- Re-exports single-function modules for backward compatibility

local M = {}

M.render_stat = require("render_stat")
M.render_stats = require("render_stats")
M.render_hero = require("render_hero")

return M
