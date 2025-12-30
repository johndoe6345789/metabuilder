-- Audit log package initialization
local M = {}

M.name = "audit_log"
M.version = "1.0.0"

function M.init()
  log("Audit log package initialized")
  return true
end

return M
