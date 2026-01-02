-- Spacing utility functions facade
-- Re-exports all spacing-related functions

local spacingEditor = require("spacing.spacing_editor")

---@class SpacingModule
local M = {}

-- Re-export spacing functions
M.generate_spacing_scale = spacingEditor.generate_spacing_scale
M.calculate_spacing = spacingEditor.calculate_spacing
M.get_spacing_presets = spacingEditor.get_spacing_presets

return M
