-- Screenshot Analyzer Package Initialization

---@class InitResult
---@field success boolean Whether initialization succeeded
---@field message string Status message

---@class AnalyzerConfig
---@field max_text_length integer Maximum text content length
---@field max_html_length integer Maximum HTML sample length
---@field analysis_timeout integer Timeout in milliseconds

---@class ScreenshotAnalyzerModule
---@field name string Package name
---@field version string Package version
---@field init fun(): InitResult Initialize the package
---@field get_config fun(): AnalyzerConfig Get configuration
local M = {}

M.name = "screenshot_analyzer"
M.version = "1.0.0"

---Initialize the screenshot analyzer package
---@return InitResult
function M.init()
  return {
    success = true,
    message = "Screenshot Analyzer package initialized"
  }
end

---Get analyzer configuration
---@return AnalyzerConfig
function M.get_config()
  return {
    max_text_length = 3000,
    max_html_length = 3000,
    analysis_timeout = 10000
  }
end

return M
