-- Apply filters to data
-- Single function module for data table filtering

local matchesAllFilters = require("filtering.matches_all_filters")

---@class ApplyFilters
local M = {}

---Apply filters to data
---@param data table[] Array of row data objects
---@param state FilterState Filter state with active filters
---@return table[] Filtered data array (new array, original unchanged)
function M.applyFilters(data, state)
  if not state.filters or #state.filters == 0 then
    return data
  end
  
  local filtered = {}
  for _, row in ipairs(data) do
    if matchesAllFilters.matchesAllFilters(row, state.filters) then
      table.insert(filtered, row)
    end
  end
  
  return filtered
end

return M
