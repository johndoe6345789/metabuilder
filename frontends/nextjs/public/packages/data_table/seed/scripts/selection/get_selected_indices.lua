-- Get array of selected indices
-- Single function module for data table selection

---@class GetSelectedIndices
local M = {}

---Get array of selected indices
---@param state SelectionState Current selection state
---@return integer[] Array of selected row indices
function M.getSelectedIndices(state)
  local indices = {}
  for k, v in pairs(state.selected) do
    if v then
      table.insert(indices, k)
    end
  end
  table.sort(indices)
  return indices
end

return M
