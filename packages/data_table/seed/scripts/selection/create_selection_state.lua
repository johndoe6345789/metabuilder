-- Create initial selection state
-- Single function module for data table selection

---@class CreateSelectionState
local M = {}

---Create initial selection state
---@param mode? "single" | "multiple" Selection mode (default: "multiple")
---@return SelectionState
function M.createSelectionState(mode)
  return {
    selected = {},
    mode = mode or "multiple",
    lastSelected = nil
  }
end

return M
