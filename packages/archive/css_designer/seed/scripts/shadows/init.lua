-- Shadow utility functions facade
-- Re-exports all shadow-related functions

local shadowEditor = require("shadows.shadow_editor")

---@class ShadowsModule
local M = {}

-- Re-export shadow functions
M.format_shadow = shadowEditor.format_shadow
M.get_shadow_presets = shadowEditor.get_shadow_presets
M.create_shadow_config = shadowEditor.create_shadow_config

return M
