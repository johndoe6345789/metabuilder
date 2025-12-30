-- Export to CSV with download metadata
-- Single function module for data table export

local exportToCsv = require("export.export_to_csv")
local createExport = require("export.create_export")

---@class DownloadCsv
local M = {}

---Export to CSV with download metadata
---@param data table[] Array of row data objects
---@param columns table[] Column definitions
---@param filename? string Suggested filename (default: "export.csv")
---@param options? ExportOptions Export options
---@return ExportObject Export object
function M.downloadCsv(data, columns, filename, options)
  local csv = exportToCsv.exportToCsv(data, columns, options)
  return createExport.createExport(csv, filename or "export.csv", "text/csv")
end

return M
