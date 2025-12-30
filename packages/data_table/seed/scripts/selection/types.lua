-- Type definitions for selection module
-- Shared across all selection functions

---@class SelectionState
---@field selected table<integer, boolean> Map of selected row indices
---@field mode "single" | "multiple" Selection mode
---@field lastSelected integer|nil Last selected index (for shift-select)

return {}
