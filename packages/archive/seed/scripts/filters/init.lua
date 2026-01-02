-- Audit log filtering module
-- Facade that re-exports all filter functions

local filterByOperation = require("filters.filter_by_operation")
local filterByResource = require("filters.filter_by_resource")
local filterBySuccess = require("filters.filter_by_success")
local filterByUsername = require("filters.filter_by_username")
local filterByDateRange = require("filters.filter_by_date_range")
local applyFilters = require("filters.apply_filters")
local getFilterOptions = require("filters.get_filter_options")

---@class FiltersModule
---@field filterByOperation fun(logs: AuditLog[]?, operation: string?): AuditLog[]
---@field filterByResource fun(logs: AuditLog[]?, resource: string?): AuditLog[]
---@field filterBySuccess fun(logs: AuditLog[]?, success: boolean?): AuditLog[]
---@field filterByUsername fun(logs: AuditLog[]?, username: string?): AuditLog[]
---@field filterByDateRange fun(logs: AuditLog[]?, startTime: number?, endTime: number?): AuditLog[]
---@field applyFilters fun(logs: AuditLog[]?, filters: ApplyFiltersInput): AuditLog[]
---@field getFilterOptions fun(logs: AuditLog[]?): FilterOptions

---@type FiltersModule
local M = {
  filterByOperation = filterByOperation.filterByOperation,
  filterByResource = filterByResource.filterByResource,
  filterBySuccess = filterBySuccess.filterBySuccess,
  filterByUsername = filterByUsername.filterByUsername,
  filterByDateRange = filterByDateRange.filterByDateRange,
  applyFilters = applyFilters.applyFilters,
  getFilterOptions = getFilterOptions.getFilterOptions,
}

return M
