-- Get column values from row data
-- Single function module for data table export

---@class GetRowValues
local M = {}

---Get column values from row data
---@param row table Row data object
---@param columns table[] Column definitions
---@param columnIds string[]|nil Specific column IDs (nil = all)
---@return string[] Array of values
function M.getRowValues(row, columns, columnIds)
  local values = {}
  
  if columnIds then
    -- Specific columns only
    for _, id in ipairs(columnIds) do
      table.insert(values, row[id])
    end
  else
    -- All columns
    for _, col in ipairs(columns) do
      if col.type ~= "actions" then
        table.insert(values, row[col.id])
      end
    end
  end
  
  return values
end

return M
