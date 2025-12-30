-- Screenshot Analyzer Package Initialization
local M = {}

M.name = "screenshot_analyzer"
M.version = "1.0.0"

function M.init()
  return {
    success = true,
    message = "Screenshot Analyzer package initialized"
  }
end

function M.get_config()
  return {
    max_text_length = 3000,
    max_html_length = 3000,
    analysis_timeout = 10000
  }
end

return M
