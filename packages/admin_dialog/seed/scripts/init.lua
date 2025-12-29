-- Admin Dialog initialization
local M = {}

M.name = "admin_dialog"
M.version = "1.0.0"

function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
