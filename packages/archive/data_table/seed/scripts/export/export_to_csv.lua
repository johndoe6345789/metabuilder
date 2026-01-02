-- Export data to CSV format
-- Single function module for data table export

local escapeCsv = require("export.escape_csv")
local getColumnLabels = require("export.get_column_labels")
local getRowValues = require("export.get_row_values")

---@class ExportToCsv
local M = {}

---Export data to CSV format
---@param data table[] Array of row data objects
---@param columns table[] Column definitions
---@param options? ExportOptions Export options
---@return string CSV formatted string
function M.exportToCsv(data, columns, options)
  options = options or {}
  local includeHeaders = options.includeHeaders ~= false
  local columnIds = options.columns
  local delimiter = options.delimiter or ","
  local lineEnding = options.lineEnding or "\n"
  
  local lines = {}
  
  -- Add header row
  if includeHeaders then
    local headers = getColumnLabels.getColumnLabels(columns, columnIds)
    local escapedHeaders = {}
    for _, h in ipairs(headers) do
      table.insert(escapedHeaders, escapeCsv.escapeCsv(h))
    end
    table.insert(lines, table.concat(escapedHeaders, delimiter))
  end
  
  -- Add data rows
  for _, row in ipairs(data) do
    local values = getRowValues.getRowValues(row, columns, columnIds)
    local escapedValues = {}
    for _, v in ipairs(values) do
      table.insert(escapedValues, escapeCsv.escapeCsv(v))
    end
    table.insert(lines, table.concat(escapedValues, delimiter))
  end
  
  return table.concat(lines, lineEnding)
end

return M
