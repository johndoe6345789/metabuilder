--- Feed rendering facade for social hub
--- Re-exports single-function modules for backward compatibility

local M = {}

M.render_post = require("render_post")
M.render_feed = require("render_feed")
M.empty_state = require("empty_state")

return M
