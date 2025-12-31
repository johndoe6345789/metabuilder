-- Formatters module for stats display
local stats = require("stats")

---@class FormattersModule
local M = {}

-- Export formatting functions
M.formatLabel = stats.formatLabel
M.formatValue = stats.formatValue

return M
