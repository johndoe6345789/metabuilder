-- Select a range of rows (for shift-click)
-- Single function module for data table selection

---@class SelectRange
local M = {}

---Select a range of rows (for shift-click)
---@param state SelectionState Current selection state
---@param from_index integer Start row index (1-indexed)
---@param to_index integer End row index (1-indexed)
---@return SelectionState New selection state
function M.selectRange(state, from_index, to_index)
  local newSelected = {}
  for k, v in pairs(state.selected) do
    newSelected[k] = v
  end
  
  local startIdx = math.min(from_index, to_index)
  local endIdx = math.max(from_index, to_index)
  
  for i = startIdx, endIdx do
    newSelected[i] = true
  end
  
  return {
    selected = newSelected,
    mode = state.mode,
    lastSelected = to_index
  }
end

return M
