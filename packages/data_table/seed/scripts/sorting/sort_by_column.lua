-- Sort data by a column
-- Single function module for data table sorting

local compare = require("sorting.compare")

---@class SortByColumn
local M = {}

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
    return compare.compare(a[column_id], b[column_id], direction)
  end)
  
  return sorted
end

return M
