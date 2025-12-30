-- Selection utilities for data tables
-- Provides row selection state management

---@class Selection
local M = {}

---@class SelectionState
---@field selected table<integer, boolean> Map of selected row indices
---@field mode "single" | "multiple" Selection mode
---@field lastSelected integer|nil Last selected index (for shift-select)

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

---Check if a row is selected
---@param state SelectionState Current selection state
---@param index integer Row index (1-indexed)
---@return boolean Whether row is selected
function M.isSelected(state, index)
  return state.selected[index] == true
end

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

---Add a row to selection (for multiple mode)
---@param state SelectionState Current selection state
---@param index integer Row index (1-indexed)
---@return SelectionState New selection state
function M.addToSelection(state, index)
  local newSelected = {}
  for k, v in pairs(state.selected) do
    newSelected[k] = v
  end
  newSelected[index] = true
  
  return {
    selected = newSelected,
    mode = state.mode,
    lastSelected = index
  }
end

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

---Check if all rows are selected
---@param state SelectionState Current selection state
---@param total integer Total number of rows
---@return boolean Whether all rows are selected
function M.isAllSelected(state, total)
  if total == 0 then return false end
  return M.getSelectionCount(state) == total
end

---Check if some (but not all) rows are selected
---@param state SelectionState Current selection state
---@param total integer Total number of rows
---@return boolean Whether some rows are selected
function M.isIndeterminate(state, total)
  local count = M.getSelectionCount(state)
  return count > 0 and count < total
end

return M
