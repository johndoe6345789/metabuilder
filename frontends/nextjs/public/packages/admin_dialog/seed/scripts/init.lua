-- Admin Dialog initialization

---@class AdminDialog
---@field name string
---@field version string
local M = {}

M.name = "admin_dialog"
M.version = "1.0.0"

---@class InitResult
---@field name string
---@field version string
---@field loaded boolean

---@return InitResult
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
