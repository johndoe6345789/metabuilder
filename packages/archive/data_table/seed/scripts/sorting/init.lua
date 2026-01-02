-- Sorting module facade
-- Re-exports all sorting functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Sorting
local M = {}

-- Import all single-function modules
local createSortState = require("sorting.create_sort_state")
local compare = require("sorting.compare")
local sortByColumn = require("sorting.sort_by_column")
local toggleSort = require("sorting.toggle_sort")
local getSortIndicator = require("sorting.get_sort_indicator")

-- Re-export all functions
M.createSortState = createSortState.createSortState
M.compare = compare.compare
M.sortByColumn = sortByColumn.sortByColumn
M.toggleSort = toggleSort.toggleSort
M.getSortIndicator = getSortIndicator.getSortIndicator

return M
