-- Add a row to selection (for multiple mode)
-- Single function module for data table selection

---@class AddToSelection
local M = {}

---Add a row to selection (for multiple mode)
---@param state SelectionState Current selection state
---@param index integer Row index (1-indexed)
---@return SelectionState New selection state
function M.addToSelection(state, index)
  local newSelected = {}
  for k, v in pairs(state.selected) do
    newSelected[k] = v
  end
  newSelected[index] = true
  
  return {
    selected = newSelected,
    mode = state.mode,
    lastSelected = index
  }
end

return M
