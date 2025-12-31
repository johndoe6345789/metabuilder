-- Border editor utility functions
-- Provides border formatting and configuration

---@class BorderEditor
local M = {}

---@type string[]
local BORDER_STYLES = { "none", "solid", "dashed", "dotted", "double" }

---Format a border CSS value
---@param config BorderConfig Border configuration
---@return string css CSS border value
function M.format_border(config)
  if config.style == "none" or config.width == 0 then
    return "none"
  end
  return config.width .. "px " .. config.style .. " " .. config.color.hex
end

---Get available border styles
---@return string[] styles Array of border style options
function M.get_border_styles()
  return BORDER_STYLES
end

---Create a border configuration
---@param width? number Border width (default 1)
---@param color? string Hex color (default #e0e0e0)
---@param style? string Border style (default solid)
---@return BorderConfig config Border configuration
function M.create_border_config(width, color, style)
  return {
    width = width or 1,
    color = { hex = color or "#e0e0e0" },
    style = style or "solid"
  }
end

return M
