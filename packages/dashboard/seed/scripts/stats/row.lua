-- Dashboard stat row layout

---@class StatRowConfig
---@field type string
---@field layout string
---@field gap number
---@field children table

---@param stats table Array of stat components to display in a row
---@return StatRowConfig
local function stat_row(stats)
  return {
    type = "row",
    layout = "flex",
    gap = 16,
    children = stats
  }
end

return stat_row
