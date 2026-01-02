-- Check if a row is selected
-- Single function module for data table selection

---@class IsSelected
local M = {}

---Check if a row is selected
---@param state SelectionState Current selection state
---@param index integer Row index (1-indexed)
---@return boolean Whether row is selected
function M.isSelected(state, index)
  return state.selected[index] == true
end

return M
