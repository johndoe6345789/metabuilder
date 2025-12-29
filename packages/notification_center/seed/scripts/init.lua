-- Notification Center initialization
local M = {}

M.name = "notification_center"
M.version = "1.0.0"

function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
