-- Sorting utilities for data tables
-- Provides column sorting logic and state management

---@class Sorting
local M = {}

---@alias SortDirection "asc" | "desc" | nil

---@class SortState
---@field column_id string|nil Column being sorted
---@field direction SortDirection Sort direction

---@class SortedResult
---@field data table[] Sorted data array
---@field state SortState Current sort state

---Create initial sort state
---@return SortState
function M.createSortState()
  return {
    column_id = nil,
    direction = nil
  }
end

---Compare two values for sorting
---@param a any First value
---@param b any Second value
---@param direction SortDirection Sort direction
---@return boolean Whether a should come before b
function M.compare(a, b, direction)
  local aVal = a
  local bVal = b
  
  -- Handle nil values (push to end)
  if aVal == nil and bVal == nil then return false end
  if aVal == nil then return direction == "desc" end
  if bVal == nil then return direction == "asc" end
  
  -- Handle different types
  local aType = type(aVal)
  local bType = type(bVal)
  
  if aType ~= bType then
    aVal = tostring(aVal)
    bVal = tostring(bVal)
  end
  
  -- Compare based on type
  if aType == "number" then
    if direction == "desc" then
      return aVal > bVal
    else
      return aVal < bVal
    end
  else
    -- String comparison (case-insensitive)
    local aLower = string.lower(tostring(aVal))
    local bLower = string.lower(tostring(bVal))
    if direction == "desc" then
      return aLower > bLower
    else
      return aLower < bLower
    end
  end
end

---Sort data by a column
---@param data table[] Array of row data objects
---@param column_id string Column identifier to sort by
---@param direction SortDirection Sort direction ("asc" or "desc")
---@return table[] Sorted data array (new array, original unchanged)
function M.sortByColumn(data, column_id, direction)
  if not column_id or not direction then
    return data
  end
  
  -- Create a copy to avoid mutating original
  local sorted = {}
  for i, row in ipairs(data) do
    sorted[i] = row
  end
  
  table.sort(sorted, function(a, b)
    return M.compare(a[column_id], b[column_id], direction)
  end)
  
  return sorted
end

---Toggle sort state for a column
---@param state SortState Current sort state
---@param column_id string Column identifier clicked
---@return SortState New sort state
function M.toggleSort(state, column_id)
  if state.column_id ~= column_id then
    -- New column: start with ascending
    return {
      column_id = column_id,
      direction = "asc"
    }
  elseif state.direction == "asc" then
    -- Same column, was ascending: switch to descending
    return {
      column_id = column_id,
      direction = "desc"
    }
  else
    -- Same column, was descending: clear sort
    return {
      column_id = nil,
      direction = nil
    }
  end
end

---Get sort indicator for a column
---@param state SortState Current sort state
---@param column_id string Column identifier to check
---@return string|nil Sort indicator ("▲", "▼", or nil)
function M.getSortIndicator(state, column_id)
  if state.column_id ~= column_id then
    return nil
  elseif state.direction == "asc" then
    return "▲"
  else
    return "▼"
  end
end

return M
