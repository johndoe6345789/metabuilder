-- Color palette generation functions
-- Creates color variations from a base color

local colorPicker = require("colors.color_picker")

---@class Palette
local M = {}

---Generate darker shades of a color
---@param hex string Base hex color
---@param count? number Number of shades (default 5)
---@return string[] shades Array of hex colors from base to darkest
function M.generate_shades(hex, count)
  count = count or 5
  local shades = { hex }
  local step = 80 / count
  
  for i = 1, count - 1 do
    local shade = colorPicker.adjust_lightness(hex, -step * i)
    table.insert(shades, shade)
  end
  
  return shades
end

---Generate lighter tints of a color
---@param hex string Base hex color
---@param count? number Number of tints (default 5)
---@return string[] tints Array of hex colors from base to lightest
function M.generate_tints(hex, count)
  count = count or 5
  local tints = { hex }
  local step = 80 / count
  
  for i = 1, count - 1 do
    local tint = colorPicker.adjust_lightness(hex, step * i)
    table.insert(tints, tint)
  end
  
  return tints
end

---Create a full color palette from a base color
---@param hex string Base hex color
---@return table palette Palette with shades and tints
function M.create_palette(hex)
  local hsl = colorPicker.hex_to_hsl(hex)
  if not hsl then
    return { base = hex, shades = {hex}, tints = {hex} }
  end
  
  -- Generate palette scales (50, 100, 200, ... 900)
  local scale = {}
  local lightness_values = {95, 90, 80, 70, 60, 50, 40, 30, 20, 10}
  local scale_names = {50, 100, 200, 300, 400, 500, 600, 700, 800, 900}
  
  for i, l in ipairs(lightness_values) do
    scale[scale_names[i]] = colorPicker.hsl_to_hex({
      h = hsl.h,
      s = hsl.s,
      l = l
    })
  end
  
  return {
    base = hex,
    scale = scale,
    shades = M.generate_shades(hex, 5),
    tints = M.generate_tints(hex, 5)
  }
end

return M
