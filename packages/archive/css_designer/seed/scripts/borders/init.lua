-- Border utility functions facade
-- Re-exports all border-related functions

local borderEditor = require("borders.border_editor")

---@class BordersModule
local M = {}

-- Re-export border functions
M.format_border = borderEditor.format_border
M.get_border_styles = borderEditor.get_border_styles
M.create_border_config = borderEditor.create_border_config

return M
