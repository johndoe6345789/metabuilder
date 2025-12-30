--- Notification summary facade
--- Re-exports single-function modules for backward compatibility

---@class SummaryModule Notification summary functions
---@field calculateTotal fun(notifications: Notification[]): number Calculate total count
---@field getSeverityClass fun(severity: string): string Get CSS class for severity
---@field prepareSummary fun(notifications: Notification[]): SummaryData Prepare summary data
---@field severityClasses table<string, string> Severity to CSS class mapping
---@field defaultItems Notification[] Default notification items
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
