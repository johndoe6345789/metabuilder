-- Apply multiple filters to audit logs

local filterByOperation = require("filters.filter_by_operation")
local filterByResource = require("filters.filter_by_resource")
local filterBySuccess = require("filters.filter_by_success")
local filterByUsername = require("filters.filter_by_username")
local filterByDateRange = require("filters.filter_by_date_range")

---@class ApplyFilters
local M = {}

---Apply multiple filters to logs
---@param logs AuditLog[]? Array of audit log entries
---@param filters ApplyFiltersInput Filter options
---@return AuditLog[] Filtered logs
function M.applyFilters(logs, filters)
  filters = filters or {}
  local result = logs or {}

  if filters.operation then
    result = filterByOperation.filterByOperation(result, filters.operation)
  end

  if filters.resource then
    result = filterByResource.filterByResource(result, filters.resource)
  end

  if filters.success ~= nil then
    result = filterBySuccess.filterBySuccess(result, filters.success)
  end

  if filters.username then
    result = filterByUsername.filterByUsername(result, filters.username)
  end

  if filters.startTime or filters.endTime then
    result = filterByDateRange.filterByDateRange(result, filters.startTime, filters.endTime)
  end

  return result
end

return M
