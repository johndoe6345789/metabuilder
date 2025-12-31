-- Audit log formatting module
-- Facade that re-exports all formatting functions

local mappings = require("formatting.mappings")
local getOperationColor = require("formatting.get_operation_color")
local getResourceIcon = require("formatting.get_resource_icon")
local formatTimestamp = require("formatting.format_timestamp")
local formatLogEntry = require("formatting.format_log_entry")
local formatAllLogs = require("formatting.format_all_logs")
local getStatusBadge = require("formatting.get_status_badge")

---@class FormattingModule
---@field operationColors table<string, string>
---@field resourceIcons table<string, string>
---@field getOperationColor fun(operation: string): string
---@field getResourceIcon fun(resource: string): string
---@field formatTimestamp fun(timestamp: number?): string
---@field formatLogEntry fun(log: AuditLog): FormattedLogEntry
---@field formatAllLogs fun(logs: AuditLog[]?): FormattedLogEntry[]
---@field getStatusBadge fun(log: AuditLog): string?

---@type FormattingModule
local M = {
  operationColors = mappings.operationColors,
  resourceIcons = mappings.resourceIcons,
  getOperationColor = getOperationColor.getOperationColor,
  getResourceIcon = getResourceIcon.getResourceIcon,
  formatTimestamp = formatTimestamp.formatTimestamp,
  formatLogEntry = formatLogEntry.formatLogEntry,
  formatAllLogs = formatAllLogs.formatAllLogs,
  getStatusBadge = getStatusBadge.getStatusBadge,
}

return M
