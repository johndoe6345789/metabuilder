--- Moderation facade for forum_forge
--- Re-exports single-function modules for backward compatibility

---@class ModerationModule Moderation functions module
---@field flag_post fun(post: { content?: string }): FlagResult Flag a post for moderation
local M = {}

M.flag_post = require("flag_post")

return M
