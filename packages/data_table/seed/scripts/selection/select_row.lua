-- Select a single row (replacing any existing selection)
-- Single function module for data table selection

---@class SelectRow
local M = {}

---Select a single row (replacing any existing selection)
---@param state SelectionState Current selection state
---@param index integer Row index (1-indexed)
---@return SelectionState New selection state
function M.selectRow(state, index)
  return {
    selected = { [index] = true },
    mode = state.mode,
    lastSelected = index
  }
end

return M
