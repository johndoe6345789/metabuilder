-- Check if all rows are selected
-- Single function module for data table selection

local getSelectionCount = require("selection.get_selection_count")

---@class IsAllSelected
local M = {}

---Check if all rows are selected
---@param state SelectionState Current selection state
---@param total integer Total number of rows
---@return boolean Whether all rows are selected
function M.isAllSelected(state, total)
  if total == 0 then return false end
  return getSelectionCount.getSelectionCount(state) == total
end

return M
