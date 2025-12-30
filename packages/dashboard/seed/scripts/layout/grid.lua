-- Dashboard grid layout

---@class GridLayoutConfig
---@field type string
---@field columns number
---@field rows? number
---@field gap number

---@param columns? number Number of columns (default: 3)
---@param rows? number Number of rows (optional)
---@param gap? number Gap between items in pixels (default: 16)
---@return GridLayoutConfig
local function grid(columns, rows, gap)
  return {
    type = "grid",
    columns = columns or 3,
    rows = rows,
    gap = gap or 16
  }
end

return grid
