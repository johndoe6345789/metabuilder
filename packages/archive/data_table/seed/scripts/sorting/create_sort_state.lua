-- Create initial sort state
-- Single function module for data table sorting

---@class CreateSortState
local M = {}

---Create initial sort state
---@return SortState
function M.createSortState()
  return {
    column_id = nil,
    direction = nil
  }
end

return M
