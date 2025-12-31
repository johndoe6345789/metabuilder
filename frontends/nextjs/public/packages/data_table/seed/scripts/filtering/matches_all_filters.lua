-- Check if a row matches all filters
-- Single function module for data table filtering

local matchesFilter = require("filtering.matches_filter")

---@class MatchesAllFilters
local M = {}

---Check if a row matches all filters
---@param row table Row data object
---@param filters Filter[] Array of filters to apply
---@return boolean Whether row matches all filters
function M.matchesAllFilters(row, filters)
  for _, filter in ipairs(filters) do
    if not matchesFilter.matchesFilter(row[filter.column_id], filter) then
      return false
    end
  end
  return true
end

return M
