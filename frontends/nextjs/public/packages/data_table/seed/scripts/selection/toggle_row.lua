-- Toggle selection of a single row
-- Single function module for data table selection

---@class ToggleRow
local M = {}

---Toggle selection of a single row
---@param state SelectionState Current selection state
---@param index integer Row index (1-indexed)
---@return SelectionState New selection state
function M.toggleRow(state, index)
  local newSelected = {}
  
  if state.mode == "single" then
    -- Single mode: only one can be selected
    if not state.selected[index] then
      newSelected[index] = true
    end
  else
    -- Multiple mode: copy existing and toggle
    for k, v in pairs(state.selected) do
      newSelected[k] = v
    end
    newSelected[index] = not newSelected[index] or nil
  end
  
  return {
    selected = newSelected,
    mode = state.mode,
    lastSelected = index
  }
end

return M
