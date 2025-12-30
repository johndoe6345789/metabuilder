-- Export data to JSON format
-- Single function module for data table export

local jsonEncode = require("export.json_encode")

---@class ExportToJson
local M = {}

---Export data to JSON format
---@param data table[] Array of row data objects
---@param columns? table[] Column definitions (optional, for column filtering)
---@param columnIds? string[] Specific columns to export (nil = all)
---@return string JSON formatted string
function M.exportToJson(data, columns, columnIds)
  local result
  
  if columns and columnIds then
    -- Export only specified columns
    result = {}
    for _, row in ipairs(data) do
      local filtered = {}
      for _, id in ipairs(columnIds) do
        filtered[id] = row[id]
      end
      table.insert(result, filtered)
    end
  else
    result = data
  end
  
  return jsonEncode.jsonEncode(result)
end

return M
