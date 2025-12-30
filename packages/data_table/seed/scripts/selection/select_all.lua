-- Select all rows
-- Single function module for data table selection

---@class SelectAll
local M = {}

---Select all rows
---@param state SelectionState Current selection state
---@param total integer Total number of rows
---@return SelectionState New selection state
function M.selectAll(state, total)
  local newSelected = {}
  for i = 1, total do
    newSelected[i] = true
  end
  
  return {
    selected = newSelected,
    mode = state.mode,
    lastSelected = total
  }
end

return M
