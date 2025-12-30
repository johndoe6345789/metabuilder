-- Type definitions for export module
-- Shared across all export functions

---@class ExportOptions
---@field includeHeaders boolean Include column headers in export
---@field columns string[]|nil Specific columns to export (nil = all)
---@field delimiter string CSV delimiter (default: ",")
---@field lineEnding string Line ending (default: "\n")

---@class ExportObject
---@field content string Export content
---@field filename string Suggested filename
---@field mimeType string MIME type

return {}
