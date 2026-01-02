-- Export module facade
-- Re-exports all export functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Export
local M = {}

-- Import all single-function modules
local escapeCsv = require("export.escape_csv")
local getRowValues = require("export.get_row_values")
local getColumnLabels = require("export.get_column_labels")
local exportToCsv = require("export.export_to_csv")
local jsonEncode = require("export.json_encode")
local exportToJson = require("export.export_to_json")
local createExport = require("export.create_export")
local downloadCsv = require("export.download_csv")
local downloadJson = require("export.download_json")

-- Re-export all functions
M.escapeCsv = escapeCsv.escapeCsv
M.getRowValues = getRowValues.getRowValues
M.getColumnLabels = getColumnLabels.getColumnLabels
M.exportToCsv = exportToCsv.exportToCsv
M.jsonEncode = jsonEncode.jsonEncode
M.exportToJson = exportToJson.exportToJson
M.createExport = createExport.createExport
M.downloadCsv = downloadCsv.downloadCsv
M.downloadJson = downloadJson.downloadJson

return M
