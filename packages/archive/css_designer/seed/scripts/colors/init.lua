-- Color utility functions facade
-- Re-exports all color-related functions

local colorPicker = require("colors.color_picker")
local palette = require("colors.palette")

---@class ColorsModule
local M = {}

-- Re-export color picker functions
M.hex_to_rgb = colorPicker.hex_to_rgb
M.rgb_to_hex = colorPicker.rgb_to_hex
M.hex_to_hsl = colorPicker.hex_to_hsl
M.hsl_to_hex = colorPicker.hsl_to_hex
M.adjust_lightness = colorPicker.adjust_lightness
M.adjust_saturation = colorPicker.adjust_saturation

-- Re-export palette functions
M.generate_shades = palette.generate_shades
M.generate_tints = palette.generate_tints
M.create_palette = palette.create_palette

return M
