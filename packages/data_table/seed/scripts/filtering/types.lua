-- Type definitions for filtering module
-- Shared across all filtering functions

---@alias FilterOperator "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte" | "between"

---@class Filter
---@field column_id string Column identifier to filter
---@field operator FilterOperator Filter operator
---@field value any Filter value (single value or {min, max} for between)

---@class FilterState
---@field filters Filter[] Active filters

return {}
