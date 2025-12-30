-- Profile module facade
-- Re-exports all profile functions for backward compatibility

local render_module = require("profile.render")
local save_module = require("profile.save_profile")

---@class ProfileModule
---@field render fun(ctx: RenderContext): UIComponent
---@field saveProfile fun(form: FormData): ProfileResponse
local M = {}

M.render = render_module.render
M.saveProfile = save_module.saveProfile

return M
