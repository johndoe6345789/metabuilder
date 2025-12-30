-- Get count of selected rows
-- Single function module for data table selection

---@class GetSelectionCount
local M = {}

---Get count of selected rows
---@param state SelectionState Current selection state
---@return integer Number of selected rows
function M.getSelectionCount(state)
  local count = 0
  for _, v in pairs(state.selected) do
    if v then
      count = count + 1
    end
  end
  return count
end

return M
