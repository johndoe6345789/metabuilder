-- Clear all filters
-- Single function module for data table filtering

---@class ClearFilters
local M = {}

---Clear all filters
---@return FilterState Empty filter state
function M.clearFilters()
  return { filters = {} }
end

return M
