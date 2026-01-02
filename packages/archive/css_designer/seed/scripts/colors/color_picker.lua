-- Color picker utility functions
-- Single-purpose module for color conversion and manipulation

---@class ColorPicker
local M = {}

---Convert hex color to RGB
---@param hex string Hex color (e.g., "#1976d2" or "1976d2")
---@return RGBColor|nil rgb RGB color or nil if invalid
function M.hex_to_rgb(hex)
  if not hex then return nil end
  
  -- Remove # prefix if present
  hex = hex:gsub("^#", "")
  
  -- Validate length
  if #hex ~= 6 and #hex ~= 3 then
    return nil
  end
  
  -- Expand shorthand (e.g., "abc" -> "aabbcc")
  if #hex == 3 then
    hex = hex:sub(1,1):rep(2) .. hex:sub(2,2):rep(2) .. hex:sub(3,3):rep(2)
  end
  
  local r = tonumber(hex:sub(1,2), 16)
  local g = tonumber(hex:sub(3,4), 16)
  local b = tonumber(hex:sub(5,6), 16)
  
  if not r or not g or not b then
    return nil
  end
  
  return { r = r, g = g, b = b }
end

---Convert RGB to hex color
---@param rgb RGBColor RGB color
---@return string hex Hex color string
function M.rgb_to_hex(rgb)
  return string.format("#%02x%02x%02x", rgb.r, rgb.g, rgb.b)
end

---Convert hex to HSL color
---@param hex string Hex color
---@return HSLColor|nil hsl HSL color or nil if invalid
function M.hex_to_hsl(hex)
  local rgb = M.hex_to_rgb(hex)
  if not rgb then return nil end
  
  local r, g, b = rgb.r / 255, rgb.g / 255, rgb.b / 255
  local max, min = math.max(r, g, b), math.min(r, g, b)
  local h, s, l = 0, 0, (max + min) / 2
  
  if max ~= min then
    local d = max - min
    s = l > 0.5 and d / (2 - max - min) or d / (max + min)
    
    if max == r then
      h = (g - b) / d + (g < b and 6 or 0)
    elseif max == g then
      h = (b - r) / d + 2
    else
      h = (r - g) / d + 4
    end
    
    h = h / 6
  end
  
  return {
    h = math.floor(h * 360),
    s = math.floor(s * 100),
    l = math.floor(l * 100)
  }
end

---Convert HSL to hex color
---@param hsl HSLColor HSL color
---@return string hex Hex color string
function M.hsl_to_hex(hsl)
  local h, s, l = hsl.h / 360, hsl.s / 100, hsl.l / 100
  
  local function hue_to_rgb(p, q, t)
    if t < 0 then t = t + 1 end
    if t > 1 then t = t - 1 end
    if t < 1/6 then return p + (q - p) * 6 * t end
    if t < 1/2 then return q end
    if t < 2/3 then return p + (q - p) * (2/3 - t) * 6 end
    return p
  end
  
  local r, g, b
  if s == 0 then
    r, g, b = l, l, l
  else
    local q = l < 0.5 and l * (1 + s) or l + s - l * s
    local p = 2 * l - q
    r = hue_to_rgb(p, q, h + 1/3)
    g = hue_to_rgb(p, q, h)
    b = hue_to_rgb(p, q, h - 1/3)
  end
  
  return M.rgb_to_hex({
    r = math.floor(r * 255 + 0.5),
    g = math.floor(g * 255 + 0.5),
    b = math.floor(b * 255 + 0.5)
  })
end

---Adjust the lightness of a color
---@param hex string Hex color
---@param amount number Amount to adjust (-100 to 100)
---@return string hex Adjusted hex color
function M.adjust_lightness(hex, amount)
  local hsl = M.hex_to_hsl(hex)
  if not hsl then return hex end
  
  hsl.l = math.max(0, math.min(100, hsl.l + amount))
  return M.hsl_to_hex(hsl)
end

---Adjust the saturation of a color
---@param hex string Hex color
---@param amount number Amount to adjust (-100 to 100)
---@return string hex Adjusted hex color
function M.adjust_saturation(hex, amount)
  local hsl = M.hex_to_hsl(hex)
  if not hsl then return hex end
  
  hsl.s = math.max(0, math.min(100, hsl.s + amount))
  return M.hsl_to_hex(hsl)
end

return M
