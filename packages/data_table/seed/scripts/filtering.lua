-- Filtering utilities for data tables
-- Provides filter application and state management

---@class Filtering
local M = {}

---@alias FilterOperator "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte" | "between"

---@class Filter
---@field column_id string Column identifier to filter
---@field operator FilterOperator Filter operator
---@field value any Filter value (single value or {min, max} for between)

---@class FilterState
---@field filters Filter[] Active filters

---Create initial filter state
---@return FilterState
function M.createFilterState()
  return {
    filters = {}
  }
end

---Check if a value matches a filter
---@param value any Value to check
---@param filter Filter Filter to apply
---@return boolean Whether value matches filter
function M.matchesFilter(value, filter)
  local op = filter.operator
  local filterVal = filter.value
  
  -- Handle nil values
  if value == nil then
    return op == "equals" and filterVal == nil
  end
  
  if op == "equals" then
    return value == filterVal
  elseif op == "contains" then
    return string.find(string.lower(tostring(value)), string.lower(tostring(filterVal)), 1, true) ~= nil
  elseif op == "startsWith" then
    local str = string.lower(tostring(value))
    local prefix = string.lower(tostring(filterVal))
    return string.sub(str, 1, #prefix) == prefix
  elseif op == "endsWith" then
    local str = string.lower(tostring(value))
    local suffix = string.lower(tostring(filterVal))
    return string.sub(str, -#suffix) == suffix
  elseif op == "gt" then
    return tonumber(value) and tonumber(value) > tonumber(filterVal)
  elseif op == "lt" then
    return tonumber(value) and tonumber(value) < tonumber(filterVal)
  elseif op == "gte" then
    return tonumber(value) and tonumber(value) >= tonumber(filterVal)
  elseif op == "lte" then
    return tonumber(value) and tonumber(value) <= tonumber(filterVal)
  elseif op == "between" then
    local num = tonumber(value)
    return num and num >= filterVal[1] and num <= filterVal[2]
  end
  
  return false
end

---Check if a row matches all filters
---@param row table Row data object
---@param filters Filter[] Array of filters to apply
---@return boolean Whether row matches all filters
function M.matchesAllFilters(row, filters)
  for _, filter in ipairs(filters) do
    if not M.matchesFilter(row[filter.column_id], filter) then
      return false
    end
  end
  return true
end

---Apply filters to data
---@param data table[] Array of row data objects
---@param state FilterState Filter state with active filters
---@return table[] Filtered data array (new array, original unchanged)
function M.applyFilters(data, state)
  if not state.filters or #state.filters == 0 then
    return data
  end
  
  local filtered = {}
  for _, row in ipairs(data) do
    if M.matchesAllFilters(row, state.filters) then
      table.insert(filtered, row)
    end
  end
  
  return filtered
end

---Add a filter to state
---@param state FilterState Current filter state
---@param column_id string Column identifier
---@param operator FilterOperator Filter operator
---@param value any Filter value
---@return FilterState New filter state
function M.addFilter(state, column_id, operator, value)
  local newFilters = {}
  
  -- Copy existing filters (replacing any for same column)
  for _, filter in ipairs(state.filters) do
    if filter.column_id ~= column_id then
      table.insert(newFilters, filter)
    end
  end
  
  -- Add new filter
  table.insert(newFilters, {
    column_id = column_id,
    operator = operator,
    value = value
  })
  
  return { filters = newFilters }
end

---Remove a filter from state
---@param state FilterState Current filter state
---@param column_id string Column identifier to remove
---@return FilterState New filter state
function M.removeFilter(state, column_id)
  local newFilters = {}
  
  for _, filter in ipairs(state.filters) do
    if filter.column_id ~= column_id then
      table.insert(newFilters, filter)
    end
  end
  
  return { filters = newFilters }
end

---Clear all filters
---@return FilterState Empty filter state
function M.clearFilters()
  return { filters = {} }
end

---Get active filter for a column
---@param state FilterState Current filter state
---@param column_id string Column identifier
---@return Filter|nil Active filter for column, or nil
function M.getFilterForColumn(state, column_id)
  for _, filter in ipairs(state.filters) do
    if filter.column_id == column_id then
      return filter
    end
  end
  return nil
end

return M
