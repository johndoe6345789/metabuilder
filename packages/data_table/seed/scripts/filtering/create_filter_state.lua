-- Create initial filter state
-- Single function module for data table filtering

---@class CreateFilterState
local M = {}

---Create initial filter state
---@return FilterState
function M.createFilterState()
  return {
    filters = {}
  }
end

return M
