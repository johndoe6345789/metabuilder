-- Get column labels for headers
-- Single function module for data table export

---@class GetColumnLabels
local M = {}

---Get column labels for headers
---@param columns table[] Column definitions
---@param columnIds string[]|nil Specific column IDs (nil = all)
---@return string[] Array of labels
function M.getColumnLabels(columns, columnIds)
  local labels = {}
  
  if columnIds then
    -- Specific columns only
    for _, id in ipairs(columnIds) do
      for _, col in ipairs(columns) do
        if col.id == id then
          table.insert(labels, col.label or col.id)
          break
        end
      end
    end
  else
    -- All columns (except actions)
    for _, col in ipairs(columns) do
      if col.type ~= "actions" then
        table.insert(labels, col.label or col.id)
      end
    end
  end
  
  return labels
end

return M
