-- Toggle sort state for a column
-- Single function module for data table sorting

---@class ToggleSort
local M = {}

---Toggle sort state for a column
---@param state SortState Current sort state
---@param column_id string Column identifier clicked
---@return SortState New sort state
function M.toggleSort(state, column_id)
  if state.column_id ~= column_id then
    -- New column: start with ascending
    return {
      column_id = column_id,
      direction = "asc"
    }
  elseif state.direction == "asc" then
    -- Same column, was ascending: switch to descending
    return {
      column_id = column_id,
      direction = "desc"
    }
  else
    -- Same column, was descending: clear sort
    return {
      column_id = nil,
      direction = nil
    }
  end
end

return M
