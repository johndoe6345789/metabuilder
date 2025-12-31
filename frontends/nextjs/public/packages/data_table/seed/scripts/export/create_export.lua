-- Create a download-ready export object
-- Single function module for data table export

---@class CreateExport
local M = {}

---Create a download-ready export object
---@param content string Export content
---@param filename string Suggested filename
---@param mimeType string MIME type
---@return ExportObject Export object with content, filename, mimeType
function M.createExport(content, filename, mimeType)
  return {
    content = content,
    filename = filename,
    mimeType = mimeType
  }
end

return M
