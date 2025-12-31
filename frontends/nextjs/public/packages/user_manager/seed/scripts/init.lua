--- User Manager initialization
--- Package entry point for user management utilities
---@module init

---@class UserManagerModule
---@field name string Package name
---@field version string Package version
---@field init fun(): table Initialize the module
local M = {}

M.name = "user_manager"
M.version = "1.0.0"

--- Initialize the user manager module
---@return table Module info
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
