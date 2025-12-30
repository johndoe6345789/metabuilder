--- Notification summary facade
--- Re-exports single-function modules for backward compatibility

local M = {}

M.calculateTotal = require("calculate_total")
M.getSeverityClass = require("get_severity_class")
M.prepareSummary = require("prepare_summary")

-- Keep config for backward compatibility
local json = require("json")
local config = json.load("summary.json")
M.severityClasses = config and config.severityClasses or {}
M.defaultItems = config and config.defaultItems or {}

return M
