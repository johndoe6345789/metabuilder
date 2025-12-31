-- Export to JSON with download metadata
-- Single function module for data table export

local exportToJson = require("export.export_to_json")
local createExport = require("export.create_export")

---@class DownloadJson
local M = {}

---Export to JSON with download metadata
---@param data table[] Array of row data objects
---@param filename? string Suggested filename (default: "export.json")
---@return ExportObject Export object
function M.downloadJson(data, filename)
  local json = exportToJson.exportToJson(data)
  return createExport.createExport(json, filename or "export.json", "application/json")
end

return M
