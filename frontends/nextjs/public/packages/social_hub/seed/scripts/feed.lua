--- Feed rendering facade for social hub
--- Re-exports single-function modules for backward compatibility
---@module feed

---@class FeedModule
---@field render_post fun(post: table): string Render single post
---@field render_feed fun(posts: table[]): string Render feed of posts
---@field empty_state fun(): string Render empty feed state
local M = {}

M.render_post = require("render_post")
M.render_feed = require("render_feed")
M.empty_state = require("empty_state")

return M
