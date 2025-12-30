-- Dashboard grid layout
local function grid(columns, rows, gap)
  return {
    type = "grid",
    columns = columns or 3,
    rows = rows,
    gap = gap or 16
  }
end

return grid
