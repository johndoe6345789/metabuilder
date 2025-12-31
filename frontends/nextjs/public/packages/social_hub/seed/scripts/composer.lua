--- Composer component facade for social hub
--- Re-exports single-function modules for backward compatibility
---@module composer

---@class ComposerModule
---@field render fun(state: table): string Render composer UI
---@field validate fun(content: string): boolean, string[] Validate post content
---@field submit fun(post: table): boolean, string Submit new post
local M = {}

M.render = require("render_composer")
M.validate = require("validate_content")
M.submit = require("submit_post")

return M
