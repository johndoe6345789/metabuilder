-- Code Editor initialization
local M = {}

M.name = "code_editor"
M.version = "1.0.0"

function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
