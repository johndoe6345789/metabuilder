--- Render a stat card component
---@param label string Stat label
---@param value number Stat value
---@param icon string Icon name
---@return StatCardComponent Stat card component
local function render_stat(label, value, icon)
  return {
    type = "stat_card",
    props = {
      label = label,
      value = value,
      icon = icon
    }
  }
end

return render_stat
