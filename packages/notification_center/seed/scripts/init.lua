-- Notification Center initialization

---@class NotificationCenter
---@field name string
---@field version string
local M = {}

M.name = "notification_center"
M.version = "1.0.0"

---@class NotificationCenterInfo
---@field name string
---@field version string
---@field loaded boolean

---@return NotificationCenterInfo
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
