-- Font utility functions facade
-- Re-exports all font-related functions

local fontSelector = require("fonts.font_selector")

---@class FontsModule
local M = {}

-- Re-export font selector functions
M.get_font_options = fontSelector.get_font_options
M.get_font_category = fontSelector.get_font_category
M.format_font_family = fontSelector.format_font_family

return M
