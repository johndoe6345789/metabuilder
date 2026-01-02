-- Selection module facade
-- Re-exports all selection functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Selection
local M = {}

-- Import all single-function modules
local createSelectionState = require("selection.create_selection_state")
local isSelected = require("selection.is_selected")
local toggleRow = require("selection.toggle_row")
local selectRow = require("selection.select_row")
local addToSelection = require("selection.add_to_selection")
local selectRange = require("selection.select_range")
local selectAll = require("selection.select_all")
local deselectAll = require("selection.deselect_all")
local getSelectedIndices = require("selection.get_selected_indices")
local getSelectionCount = require("selection.get_selection_count")
local isAllSelected = require("selection.is_all_selected")
local isIndeterminate = require("selection.is_indeterminate")

-- Re-export all functions
M.createSelectionState = createSelectionState.createSelectionState
M.isSelected = isSelected.isSelected
M.toggleRow = toggleRow.toggleRow
M.selectRow = selectRow.selectRow
M.addToSelection = addToSelection.addToSelection
M.selectRange = selectRange.selectRange
M.selectAll = selectAll.selectAll
M.deselectAll = deselectAll.deselectAll
M.getSelectedIndices = getSelectedIndices.getSelectedIndices
M.getSelectionCount = getSelectionCount.getSelectionCount
M.isAllSelected = isAllSelected.isAllSelected
M.isIndeterminate = isIndeterminate.isIndeterminate

return M
