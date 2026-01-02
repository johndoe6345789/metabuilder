-- Config module for role editor
local role_editor = require("role.editor")

---@class ConfigModule
local M = {}

-- Export the editor component
M.RoleEditor = role_editor

return M
