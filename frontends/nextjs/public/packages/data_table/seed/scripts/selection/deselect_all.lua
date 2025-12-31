-- Deselect all rows
-- Single function module for data table selection

---@class DeselectAll
local M = {}

---Deselect all rows
---@param state SelectionState Current selection state
---@return SelectionState New selection state
function M.deselectAll(state)
  return {
    selected = {},
    mode = state.mode,
    lastSelected = nil
  }
end

return M
