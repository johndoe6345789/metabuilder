--- Scene management facade
--- Re-exports single-function modules for backward compatibility

local M = {}

M.render_scene = require("render_scene")
M.render_list = require("render_scene_list")
M.switch = require("switch_scene")
M.create = require("create_scene")

return M
