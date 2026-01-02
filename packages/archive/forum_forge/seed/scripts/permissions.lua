--- Permissions facade for forum_forge
--- Re-exports single-function modules for backward compatibility
---@module permissions

---@class PermissionsModule
---@field can_post fun(user_id: string, forum_id: string): boolean Check if user can post
---@field can_moderate fun(user_id: string, forum_id: string): boolean Check if user can moderate
local M = {}

M.can_post = require("can_post")
M.can_moderate = require("can_moderate")

return M
