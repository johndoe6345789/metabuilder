--- Scene management facade
--- Re-exports single-function modules for backward compatibility
---@module scenes

---@class ScenesModule
---@field render_scene fun(scene: table): string Render single scene
---@field render_list fun(scenes: table[]): string Render scene list
---@field switch fun(scene_id: string): boolean Switch to scene
---@field create fun(scene: table): string Create new scene
local M = {}

M.render_scene = require("render_scene")
M.render_list = require("render_scene_list")
M.switch = require("switch_scene")
M.create = require("create_scene")

return M
