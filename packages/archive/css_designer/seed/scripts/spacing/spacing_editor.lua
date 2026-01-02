-- Spacing editor utility functions
-- Provides spacing calculations and presets

---@class SpacingEditor
local M = {}

---@class SpacingPreset
---@field name string Preset name
---@field unit number Base spacing unit
---@field radius number Border radius
---@field description string Description

---@type SpacingPreset[]
local SPACING_PRESETS = {
  { name = "Compact", unit = 4, radius = 2, description = "Tight spacing for dense UIs" },
  { name = "Default", unit = 8, radius = 4, description = "Standard spacing" },
  { name = "Comfortable", unit = 12, radius = 8, description = "More breathing room" },
  { name = "Spacious", unit = 16, radius = 12, description = "Maximum whitespace" }
}

---Generate a spacing scale from a base unit
---@param baseUnit number Base spacing unit in pixels
---@return SpacingScale scale Spacing scale with xs through xl
function M.generate_spacing_scale(baseUnit)
  return {
    xs = baseUnit * 0.5,
    sm = baseUnit,
    md = baseUnit * 2,
    lg = baseUnit * 3,
    xl = baseUnit * 4
  }
end

---Calculate spacing value for a multiplier
---@param baseUnit number Base spacing unit
---@param multiplier number Multiplier (0.5, 1, 2, 3, 4, etc.)
---@return number pixels Calculated spacing in pixels
function M.calculate_spacing(baseUnit, multiplier)
  return baseUnit * multiplier
end

---Get available spacing presets
---@return SpacingPreset[] presets Array of spacing presets
function M.get_spacing_presets()
  return SPACING_PRESETS
end

return M
