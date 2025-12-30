-- Check if some (but not all) rows are selected
-- Single function module for data table selection

local getSelectionCount = require("selection.get_selection_count")

---@class IsIndeterminate
local M = {}

---Check if some (but not all) rows are selected
---@param state SelectionState Current selection state
---@param total integer Total number of rows
---@return boolean Whether some rows are selected
function M.isIndeterminate(state, total)
  local count = getSelectionCount.getSelectionCount(state)
  return count > 0 and count < total
end

return M
