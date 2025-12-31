-- Quick Guide package initialization

---@class QuickGuideModule
---@field name string Package name
---@field version string Package version
---@field init fun(): boolean Initialize the module
local M = {}

M.name = "quick_guide"
M.version = "1.0.0"

---Initialize the quick guide module
---@return boolean Success status
function M.init()
  log("Quick Guide package initialized")
  return true
end

return M
