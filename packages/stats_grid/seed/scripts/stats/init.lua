-- Stats grid module
require("stats.types")
local json = require("json")

---@class StatsModule
local M = {}

-- Load configuration from JSON
---@type GridConfig
M.gridConfig = json.load("config.json")

---Get color class for a stat
---@param color StatColor
---@return string
function M.getColorClass(color)
  return M.gridConfig.colorClasses[color] or M.gridConfig.colorClasses.white
end

---Get default grid class
---@return string
function M.getDefaultGridClass()
  return M.gridConfig.defaultGridClass
end

---Get default card class
---@return string
function M.getDefaultCardClass()
  return M.gridConfig.defaultCardClass
end

---Create stat items from data and config
---@param stats StatsData
---@param config? StatConfig[]
---@return StatItem[]
function M.createStatItems(stats, config)
  local items = {}

  if config then
    -- Use provided config
    for _, cfg in ipairs(config) do
      table.insert(items, {
        key = cfg.key,
        label = cfg.label,
        value = stats[cfg.key] or 0,
        color = cfg.color
      })
    end
  else
    -- Auto-generate from stats data
    for key, value in pairs(stats) do
      table.insert(items, {
        key = key,
        label = M.formatLabel(key),
        value = value,
        color = "white"
      })
    end
  end

  return items
end

---Format a key into a human-readable label
---@param key string
---@return string
function M.formatLabel(key)
  -- Convert snake_case or camelCase to Title Case
  local label = key:gsub("_", " "):gsub("(%l)(%u)", "%1 %2")
  return label:gsub("^%l", string.upper)
end

---Format a number value for display
---@param value number
---@return string
function M.formatValue(value)
  if value >= 1000000 then
    return string.format("%.1fM", value / 1000000)
  elseif value >= 1000 then
    return string.format("%.1fK", value / 1000)
  else
    return tostring(value)
  end
end

return M
