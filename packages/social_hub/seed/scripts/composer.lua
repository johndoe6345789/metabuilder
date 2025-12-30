--- Composer component facade for social hub
--- Re-exports single-function modules for backward compatibility

local M = {}

M.render = require("render_composer")
M.validate = require("validate_content")
M.submit = require("submit_post")

return M
