--- Permissions facade for forum_forge
--- Re-exports single-function modules for backward compatibility

local M = {}

M.can_post = require("can_post")
M.can_moderate = require("can_moderate")

return M
