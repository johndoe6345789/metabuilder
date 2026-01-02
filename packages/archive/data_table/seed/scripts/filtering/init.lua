-- Filtering module facade
-- Re-exports all filtering functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Filtering
local M = {}

-- Import all single-function modules
local createFilterState = require("filtering.create_filter_state")
local matchesFilter = require("filtering.matches_filter")
local matchesAllFilters = require("filtering.matches_all_filters")
local applyFilters = require("filtering.apply_filters")
local addFilter = require("filtering.add_filter")
local removeFilter = require("filtering.remove_filter")
local clearFilters = require("filtering.clear_filters")
local getFilterForColumn = require("filtering.get_filter_for_column")

-- Re-export all functions
M.createFilterState = createFilterState.createFilterState
M.matchesFilter = matchesFilter.matchesFilter
M.matchesAllFilters = matchesAllFilters.matchesAllFilters
M.applyFilters = applyFilters.applyFilters
M.addFilter = addFilter.addFilter
M.removeFilter = removeFilter.removeFilter
M.clearFilters = clearFilters.clearFilters
M.getFilterForColumn = getFilterForColumn.getFilterForColumn

return M
