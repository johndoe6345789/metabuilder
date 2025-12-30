-- Shadow editor utility functions
-- Provides shadow formatting and presets

---@class ShadowEditor
local M = {}

---@type ShadowPreset[]
local SHADOW_PRESETS = {
  {
    name = "None",
    config = { blur = 0, spread = 0, opacity = 0, offsetX = 0, offsetY = 0 }
  },
  {
    name = "Small",
    config = { blur = 2, spread = 0, opacity = 10, offsetX = 0, offsetY = 1 }
  },
  {
    name = "Medium",
    config = { blur = 4, spread = 0, opacity = 15, offsetX = 0, offsetY = 2 }
  },
  {
    name = "Large",
    config = { blur = 8, spread = 0, opacity = 20, offsetX = 0, offsetY = 4 }
  },
  {
    name = "XLarge",
    config = { blur = 16, spread = 2, opacity = 25, offsetX = 0, offsetY = 8 }
  }
}

---Format a shadow CSS value
---@param config ShadowConfig Shadow configuration
---@return string css CSS box-shadow value
function M.format_shadow(config)
  if config.opacity == 0 or config.blur == 0 then
    return "none"
  end
  
  local offsetX = config.offsetX or 0
  local offsetY = config.offsetY or 2
  local opacity = config.opacity / 100
  
  return string.format(
    "%dpx %dpx %dpx %dpx rgba(0, 0, 0, %.2f)",
    offsetX,
    offsetY,
    config.blur,
    config.spread,
    opacity
  )
end

---Get available shadow presets
---@return ShadowPreset[] presets Array of shadow presets
function M.get_shadow_presets()
  return SHADOW_PRESETS
end

---Create a shadow configuration
---@param blur? number Blur radius (default 4)
---@param spread? number Spread radius (default 0)
---@param opacity? number Opacity 0-100 (default 15)
---@return ShadowConfig config Shadow configuration
function M.create_shadow_config(blur, spread, opacity)
  return {
    blur = blur or 4,
    spread = spread or 0,
    opacity = opacity or 15,
    offsetX = 0,
    offsetY = 2
  }
end

return M
