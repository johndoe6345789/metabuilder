-- Type definitions for sorting module
-- Shared across all sorting functions

---@alias SortDirection "asc" | "desc" | nil

---@class SortState
---@field column_id string|nil Column being sorted
---@field direction SortDirection Sort direction

---@class SortedResult
---@field data table[] Sorted data array
---@field state SortState Current sort state

return {}
